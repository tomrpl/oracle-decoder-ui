##

Follow the instructions on the deploy preview.

Website url:
https://oracle-decoder.netlify.app

// Example usage

// Sould display: wrong decimal check
// const oracleAddress = "0x90CFE73B913ee1B93EA75Aa47134b7330289a458";
// "weETH", "USDC"

// Should display: warning: hardcoded oracle
// const oracleAddress = "0x5D916980D5Ae1737a8330Bf24dF812b2911Aae25";
// "sUSDe", "DAI"

// Should display only green checks
// const oracleAddress = "0x2b6eFE10F7C7c0f2fD172213ad99017855a8E512";
// "LINK", "USDC"

// Shoudl be gud:
// const oracleAddress = "0x8255593A4d01623BCA9CD882ddFeb723586f412D";
// "wUSDM", "USDC"
/\*

- Ne pas throw
- Un ENUM avec tous les types d'error et
- un mapping de l'erreur qui prend comme clé une valeur de l'enum et comme valuer soit une string
  si on veut ecrire le message à afficher soit un string, soit un object.

- la var d'état react qui peut contenir un tableau (array) et les fonctions viennent rajouter à cette état toutes les erruers qu'elles trouvent.
- il faut aussi gerer idealement les loading state
  soit un enum qui fait toutes les erreurs, soit un enum par check.

- loading state (commencé, ou pas)
- error state (check specific)
- result state (check specific - contenu du resultat)

Mettre la logic dans un hook.
Cette logique doit etre déportée dans un jhook, et ne doit pas etre liée à ce composant).

Faire un hook par type de check.

\*/
