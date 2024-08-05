import { useState } from "react";
import { Provider, ZeroAddress, ethers, formatUnits } from "ethers";
import { Asset, OracleInputs } from "../types";
import { ErrorTypes } from "../../services/errorTypes";
import AggregatorV3Interface from "../../services/abis/AggregatorV3Interface.json";
import IERC4626 from "../../services/abis/IERC4626.json";
import "evm-maths";
import { MulticallWrapper } from "ethers-multicall-provider";
import { getProvider } from "../../services/provider/provider";

async function calculateScaleFactor(
  provider: Provider,
  oracleInputs: OracleInputs
) {
  const baseFeed1 =
    oracleInputs.baseFeed1 === ZeroAddress
      ? null
      : new ethers.Contract(
          oracleInputs.baseFeed1,
          AggregatorV3Interface.abi,
          provider
        );
  const baseFeed2 =
    oracleInputs.baseFeed2 === ZeroAddress
      ? null
      : new ethers.Contract(
          oracleInputs.baseFeed2,
          AggregatorV3Interface.abi,
          provider
        );
  const quoteFeed1 =
    oracleInputs.quoteFeed1 === ZeroAddress
      ? null
      : new ethers.Contract(
          oracleInputs.quoteFeed1,
          AggregatorV3Interface.abi,
          provider
        );
  const quoteFeed2 =
    oracleInputs.quoteFeed2 === ZeroAddress
      ? null
      : new ethers.Contract(
          oracleInputs.quoteFeed2,
          AggregatorV3Interface.abi,
          provider
        );

  const [
    baseFeed1Decimals,
    baseFeed2Decimals,
    quoteFeed1Decimals,
    quoteFeed2Decimals,
  ] = await Promise.all([
    baseFeed1 ? baseFeed1.decimals() : Promise.resolve(0),
    baseFeed2 ? baseFeed2.decimals() : Promise.resolve(0),
    quoteFeed1 ? quoteFeed1.decimals() : Promise.resolve(0),
    quoteFeed2 ? quoteFeed2.decimals() : Promise.resolve(0),
  ]);

  const scaleFactor =
    (BigInt.pow10(
      BigInt(36) +
        BigInt(oracleInputs.quoteTokenDecimals) +
        BigInt(quoteFeed1Decimals) +
        BigInt(quoteFeed2Decimals) -
        BigInt(oracleInputs.baseTokenDecimals) -
        BigInt(baseFeed1Decimals) -
        BigInt(baseFeed2Decimals)
    ) *
      BigInt(oracleInputs.quoteVaultConversionSample)) /
    BigInt(oracleInputs.baseVaultConversionSample);
  return scaleFactor;
}

async function getPrice(
  provider: Provider,
  oracleInputs: OracleInputs,
  scaleFactor: bigint
) {
  const baseFeed1 =
    oracleInputs.baseFeed1 === ZeroAddress
      ? null
      : new ethers.Contract(
          oracleInputs.baseFeed1,
          AggregatorV3Interface.abi,
          provider
        );
  const baseFeed2 =
    oracleInputs.baseFeed2 === ZeroAddress
      ? null
      : new ethers.Contract(
          oracleInputs.baseFeed2,
          AggregatorV3Interface.abi,
          provider
        );
  const quoteFeed1 =
    oracleInputs.quoteFeed1 === ZeroAddress
      ? null
      : new ethers.Contract(
          oracleInputs.quoteFeed1,
          AggregatorV3Interface.abi,
          provider
        );
  const quoteFeed2 =
    oracleInputs.quoteFeed2 === ZeroAddress
      ? null
      : new ethers.Contract(
          oracleInputs.quoteFeed2,
          AggregatorV3Interface.abi,
          provider
        );

  const baseVault =
    oracleInputs.baseVault === ZeroAddress
      ? null
      : new ethers.Contract(oracleInputs.baseVault, IERC4626.abi, provider);
  const quoteVault =
    oracleInputs.quoteVault === ZeroAddress
      ? null
      : new ethers.Contract(oracleInputs.quoteVault, IERC4626.abi, provider);

  const [
    baseFeed1Price,
    baseFeed2Price,
    quoteFeed1Price,
    quoteFeed2Price,
    baseVaultAssets,
    quoteVaultAssets,
  ] = await Promise.all([
    baseFeed1
      ? baseFeed1.latestRoundData().then((data) => BigInt(data.answer))
      : Promise.resolve(BigInt(1)),
    baseFeed2
      ? baseFeed2.latestRoundData().then((data) => BigInt(data.answer))
      : Promise.resolve(BigInt(1)),
    quoteFeed1
      ? quoteFeed1.latestRoundData().then((data) => BigInt(data.answer))
      : Promise.resolve(BigInt(1)),
    quoteFeed2
      ? quoteFeed2.latestRoundData().then((data) => BigInt(data.answer))
      : Promise.resolve(BigInt(1)),
    baseVault
      ? baseVault.convertToAssets(
          BigInt(oracleInputs.baseVaultConversionSample)
        )
      : Promise.resolve(BigInt(oracleInputs.baseVaultConversionSample)),
    quoteVault
      ? quoteVault.convertToAssets(
          BigInt(oracleInputs.quoteVaultConversionSample)
        )
      : Promise.resolve(BigInt(oracleInputs.quoteVaultConversionSample)),
  ]);

  const price = scaleFactor.mulDivDown(
    BigInt(baseFeed1Price) * BigInt(baseFeed2Price) * BigInt(baseVaultAssets),
    BigInt(quoteVaultAssets) * BigInt(quoteFeed1Price) * BigInt(quoteFeed2Price)
  );

  return price;
}

const PRECISION = BigInt(1e18);

const useOraclePriceCheck = (
  chainId: number,
  oracleInputs: OracleInputs,
  collateralAsset: string,
  loanAsset: string,
  assets: Asset[]
) => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ErrorTypes[]>([]);

  const priceCheck = async () => {
    try {
      setLoading(true);
      setErrors([]);

      const provider = MulticallWrapper.wrap(getProvider(chainId));
      const scaleFactor = await calculateScaleFactor(provider, oracleInputs);
      const price = await getPrice(provider, oracleInputs, scaleFactor);
      const collateral = assets.find(
        (asset) => asset.value === collateralAsset
      );
      const loan = assets.find((asset) => asset.value === loanAsset);
      // Helper function to convert a number to BigInt with high precision
      const toBigIntWithPrecision = (value: number) => {
        return BigInt(Math.round(value * Number(PRECISION)));
      };

      const collateralPriceUsd = collateral
        ? toBigIntWithPrecision(collateral.priceUsd)
        : BigInt(0);

      const loanPriceUsd = loan
        ? toBigIntWithPrecision(loan.priceUsd)
        : BigInt(0);
      if (loanPriceUsd === BigInt(0)) {
        setErrors((prevErrors) => [
          ...prevErrors,
          ErrorTypes.LOAN_ASSET_ZERO_PRICE,
        ]);
        setResult({
          scaleFactor: scaleFactor.toString(),
          price: price.toString(),
          priceUnscaledInCollateralTokenDecimals: formatUnits(
            price,
            Number(
              36 -
                Number(collateral?.decimals ?? 18) +
                Number(loan?.decimals ?? 18)
            )
          ),
          collateralPriceUsd: formatUnits(collateralPriceUsd),
          loanPriceUsd: "0",
          ratioUsdPrice: "N/A",
          oraclePriceEquivalent: "N/A",
          percentageDifference: "N/A",
          isVerified: false,
        });
        return;
      }
      const collateralDecimals = BigInt(collateral?.decimals ?? 18);
      const loanDecimals = BigInt(loan?.decimals ?? 18);
      // allowing us to not suffer of a div by zero error.
      const ratioUsdPrice = collateralPriceUsd.wadDiv(loanPriceUsd) + BigInt(1);
      // Calculate oracle price equivalent with high precision
      const oraclePriceEquivalent =
        (price * PRECISION) /
        BigInt.pow10(BigInt(36) + loanDecimals - collateralDecimals);

      // Calculate percentage difference with high precision
      const percentageDifference =
        ((oraclePriceEquivalent - ratioUsdPrice) * BigInt(100) * PRECISION) /
        ratioUsdPrice;

      const isVerified =
        percentageDifference <= BigInt(10) * PRECISION &&
        percentageDifference >= BigInt(-10) * PRECISION;

      setResult({
        scaleFactor: scaleFactor.toString(),
        price: price.toString(),
        priceUnscaledInCollateralTokenDecimals: formatUnits(
          price,
          Number(36 - Number(collateralDecimals) + Number(loanDecimals))
        ),
        collateralPriceUsd: formatUnits(collateralPriceUsd),
        loanPriceUsd: formatUnits(loanPriceUsd),
        ratioUsdPrice: formatUnits(ratioUsdPrice),
        oraclePriceEquivalent: formatUnits(oraclePriceEquivalent),
        percentageDifference: formatUnits(percentageDifference),
        isVerified,
      });
    } catch (error) {
      console.error("Error fetching price data:", error);
      setErrors((prevErrors) => [...prevErrors, ErrorTypes.FETCH_PRICE_ERROR]);
    } finally {
      setLoading(false);
    }
  };

  return { loading, errors, result, priceCheck };
};

export default useOraclePriceCheck;
