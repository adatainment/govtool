import {
  Address,
  RewardAddress,
} from "@emurgo/cardano-serialization-lib-asmjs";
import i18n from "@/i18n";

export const URL_REGEX =
  /^(?:(?:https?:\/\/)?(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})(?:\/[^\s]*)?)|(?:ipfs:\/\/[a-f0-9]+(?:\/[a-zA-Z0-9_]+)*)$|^$/;
export const HASH_REGEX = /^[0-9A-Fa-f]+$/;
export const PAYMENT_ADDRESS_REGEX = /addr1[a-z0-9]+/i;

export function isValidURLFormat(str: string) {
  if (!str.length) return false;
  return URL_REGEX.test(str);
}

export function isValidHashFormat(str: string) {
  if (!str.length) return false;
  return HASH_REGEX.test(str);
}

export function isValidURLLength(s: string) {
  if (s.length > 128) {
    return i18n.t("forms.errors.tooLongUrl");
  }

  const encoder = new TextEncoder();
  const byteLength = encoder.encode(s).length;

  return byteLength <= 128 ? true : i18n.t("forms.errors.tooLongUrl");
}

export async function isRewardAddress(address: string) {
  try {
    const stake = RewardAddress.from_address(Address.from_bech32(address));
    return stake ? true : i18n.t("forms.errors.mustBeStakeAddress");
  } catch (e) {
    return i18n.t("forms.errors.mustBeStakeAddress");
  }
}

export async function isReceivingAddress(address: string) {
  try {
    const receivingAddress = Address.from_bech32(address);
    return receivingAddress
      ? true
      : i18n.t("forms.errors.mustBeReceivingAddress");
  } catch (e) {
    return i18n.t("forms.errors.mustBeReceivingAddress");
  }
}
