import { faker } from "@faker-js/faker";

export const invalid = {
  url: () => {
    const invalidSchemes = ["ftp", "unsupported", "unknown-scheme"];
    const invalidCharacters = "<>@!#$%^&*()";
    const invalidTlds = [".invalid", ".example", ".test"];

    const scheme =
      invalidSchemes[Math.floor(Math.random() * invalidSchemes.length)];
    const invalidChar =
      invalidCharacters[Math.floor(Math.random() * invalidCharacters.length)];
    const invalidTld =
      invalidTlds[Math.floor(Math.random() * invalidTlds.length)];

    const randomDomain = `example${invalidChar}domain${invalidTld}`;
    return `${scheme}://${randomDomain}`;
  },

  name: () => {
    const choice = faker.number.int({ min: 1, max: 3 });
    if (choice === 1) {
      // space invalid
      return faker.lorem.word() + " " + faker.lorem.word();
    } else if (choice === 2) {
      // maximum 80 words invalid
      return faker.lorem.paragraphs().replace(/\s+/g, "");
    }
    // empty invalid
    return " ";
  },

  username: () => {
    const choice = faker.number.int({ min: 1, max: 6 });
    if (choice === 1) {
      // Contains a space, which is invalid
      return faker.lorem.word() + " " + faker.lorem.word();
    } else if (choice === 2) {
      // Exceeds 30 characters, which is invalid
      return faker.lorem.words(31).replace(/\s+/g, "");
    } else if (choice === 3) {
      // Starts with a period, which is invalid
      return "." + faker.internet.userName();
    } else if (choice === 4) {
      // Starts with an underscore, which is invalid
      return "_" + faker.internet.userName();
    } else if (choice === 5) {
      // Contains an invalid character, such as a symbol
      return faker.internet.userName() + "#";
    } else if (choice === 6) {
      // Contains a hyphen
      return faker.internet.userName() + "-";
    }
  },

  email: () => {
    const choice = faker.number.int({ min: 1, max: 3 });

    if (choice === 1) {
      return faker.lorem.word() + faker.number + "@invalid.com";
    } else if (choice == 2) {
      return faker.lorem.word() + "@";
    }
    return faker.lorem.word() + "@gmail_com";
  },

  proposalTitle: () => {
    const choice = faker.number.int({ min: 1, max: 2 });
    if (choice === 1) {
      // maximum 80 words invalid
      return faker.lorem.paragraphs(4).replace(/\s+/g, "");
    }
    // empty invalid
    return " ";
  },

  paragraph: () => {
    const choice = faker.number.int({ min: 1, max: 2 });
    if (choice === 1) {
      // maximum 500 words
      return faker.lorem.paragraphs(40);
    }
    // empty invalid
    return " ";
  },

  amount: () => {
    return faker.lorem.word();
  },
};

export const valid = {
  username: () => {
    let timeStamp = Date.now();
    let username = `${faker.internet.userName().toLowerCase()}_${timeStamp}`;

    // Remove any invalid characters
    username = username.replace(/[^a-z0-9._]/g, "");

    // Ensure the username is between 1 and 30 characters
    if (username.length > 30) {
      username = username.substring(0, 30);
    }

    // Ensure the first character is not a period or underscore
    if (username.startsWith(".") || username.startsWith("_")) {
      username = "a" + username.substring(1);
    }

    // Ensure the username is not empty after the transformations
    if (username.length === 0) {
      username = "user" + faker.number.int({ min: 1, max: 9999 });
    }

    return username;
  },
  metadata: () => ({
    "@context": {
      "@language": "en-us",
      CIP100:
        "https://github.com/cardano-foundation/CIPs/blob/master/CIP-0100/README.md#",
      CIPQQQ:
        "https://github.com/cardano-foundation/CIPs/blob/master/CIP-QQQ/README.md#",
      hashAlgorithm: "CIP100:hashAlgorithm",
      body: {
        "@id": "CIPQQQ:body",
        "@context": {
          references: {
            "@id": "CIPQQQ:references",
            "@container": "@set",
            "@context": {
              GovernanceMetadata: "CIP100:GovernanceMetadataReference",
              Other: "CIP100:OtherReference",
              label: "CIP100:reference-label",
              uri: "CIP100:reference-uri",
              referenceHash: {
                "@id": "CIPQQQ:referenceHash",
                "@context": {
                  hashDigest: "CIPQQQ:hashDigest",
                  hashAlgorithm: "CIP100:hashAlgorithm",
                },
              },
            },
          },
          dRepName: "CIPQQQ:dRepName",
          bio: "CIPQQQ:bio",
          email: "CIPQQQ:email",
        },
      },
      authors: {
        "@id": "CIP100:authors",
        "@container": "@set",
        "@context": {
          name: "http://xmlns.com/foaf/0.1/name",
          witness: {
            "@id": "CIP100:witness",
            "@context": {
              witnessAlgorithm: "CIP100:witnessAlgorithm",
              publicKey: "CIP100:publicKey",
              signature: "CIP100:signature",
            },
          },
        },
      },
    },
    authors: [],
    hashAlgorithm: {
      "@value": "blake2b-256",
    },
    body: {
      bio: {
        "@value": faker.lorem.sentences(),
      },
      dRepName: {
        "@value": faker.person.firstName(),
      },
      email: {
        "@value": faker.internet.email(),
      },
      references: [
        {
          "@type": "Other",
          label: {
            "@value": "Label",
          },
          uri: {
            "@value": faker.internet.url(),
          },
        },
      ],
    },
  }),
};
