import { useState } from "react";
import { Provider, ZeroAddress, ethers, formatUnits } from "ethers";
import { OracleInputs } from "./useOracleInputs";
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
      ? baseFeed1.latestRoundData().then((data) => data.answer)
      : Promise.resolve(1),
    baseFeed2
      ? baseFeed2.latestRoundData().then((data) => data.answer)
      : Promise.resolve(1),
    quoteFeed1
      ? quoteFeed1.latestRoundData().then((data) => data.answer)
      : Promise.resolve(1),
    quoteFeed2
      ? quoteFeed2.latestRoundData().then((data) => data.answer)
      : Promise.resolve(1),
    baseVault
      ? baseVault.convertToAssets(oracleInputs.baseVaultConversionSample)
      : Promise.resolve(oracleInputs.baseVaultConversionSample),
    quoteVault
      ? quoteVault.convertToAssets(oracleInputs.quoteVaultConversionSample)
      : Promise.resolve(oracleInputs.quoteVaultConversionSample),
  ]);

  const price = scaleFactor.mulDivDown(
    BigInt(baseFeed1Price) * BigInt(baseFeed2Price) * BigInt(baseVaultAssets),
    BigInt(quoteVaultAssets) * BigInt(quoteFeed1Price) * BigInt(quoteFeed2Price)
  );

  return price;
}

const useOraclePriceCheck = (
  chainId: number,
  oracleInputs: OracleInputs,
  collateralAsset: string,
  loanAsset: string,
  assets: {
    value: string;
    label: string;
    decimals: number;
    priceUsd: number;
  }[]
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
      const collateralPriceUsd = collateral
        ? BigInt(Math.round(collateral.priceUsd))
        : BigInt(0);
      const loanPriceUsd = loan ? BigInt(Math.round(loan.priceUsd)) : BigInt(0);
      const collateralDecimals = collateral?.decimals ?? 18;
      const loanDecimals = loan?.decimals ?? 18;

      const priceUnscaledInCollateralTokenDecimals = formatUnits(
        price,
        36 - collateralDecimals + loanDecimals
      );

      const ratioUsdPrice = collateralPriceUsd / loanPriceUsd;
      const oraclePriceEquivalentInUsd = BigInt(price);

      const percentageDifference =
        ((oraclePriceEquivalentInUsd /
          BigInt.pow10(36 - collateralDecimals + loanDecimals) -
          ratioUsdPrice) *
          BigInt(100)) /
        ratioUsdPrice;

      const isVerified =
        percentageDifference <= BigInt(10) &&
        percentageDifference >= -BigInt(10);

      setResult({
        scaleFactor: scaleFactor.toString(),
        price: price.toString(),
        priceUnscaledInCollateralTokenDecimals:
          priceUnscaledInCollateralTokenDecimals.toString(),
        collateralPriceUsd: collateralPriceUsd.toString(),
        loanPriceUsd: loanPriceUsd.toString(),
        ratioUsdPrice: ratioUsdPrice.toString(),
        percentageDifference: percentageDifference.toString(),
        isVerified,
      });
    } catch (error) {
      console.error("Error fetching oracle data:", error);
      setErrors((prevErrors) => [...prevErrors, ErrorTypes.FETCH_ERROR]);
    } finally {
      setLoading(false);
    }
  };

  return { loading, errors, result, priceCheck };
};

export default useOraclePriceCheck;
