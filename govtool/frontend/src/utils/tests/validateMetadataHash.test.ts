import { vi } from "vitest";
import { postValidate } from "@services";
import { checkIsMissingGAMetadata } from "..";
import { MetadataStandard, MetadataValidationStatus } from "@/models";

const url = "https://example.com";
const hash = "abcdefg";

vi.mock("@services");

const mockPostValidate = postValidate as jest.MockedFunction<
  typeof postValidate
>;

describe("checkIsMissingGAMetadata", () => {
  it("returns false when there are no issues with the metadata", async () => {
    mockPostValidate.mockResolvedValueOnce({
      valid: true,
    });

    const result = await checkIsMissingGAMetadata({ url, hash });

    expect(result).toBe(false);
    expect(mockPostValidate).toHaveBeenCalledWith({
      url,
      hash,
      standard: MetadataStandard.CIP108,
    });
  });

  it("returns MetadataValidationStatus.INVALID_HASH when postValidate resolves with INVALID_HASH", async () => {
    mockPostValidate.mockResolvedValueOnce({
      valid: false,
      status: MetadataValidationStatus.INVALID_HASH,
    });

    const result = await checkIsMissingGAMetadata({ url, hash });

    expect(result).toBe(MetadataValidationStatus.INVALID_HASH);
    expect(mockPostValidate).toHaveBeenCalledWith({
      url,
      hash,
      standard: MetadataStandard.CIP108,
    });
  });

  it("returns MetadataValidationStatus.INVALID_JSONLD when postValidate resolves with INVALID_JSONLD", async () => {
    mockPostValidate.mockResolvedValueOnce({
      valid: false,
      status: MetadataValidationStatus.INVALID_JSONLD,
    });

    const result = await checkIsMissingGAMetadata({ url, hash });

    expect(result).toBe(MetadataValidationStatus.INVALID_JSONLD);
    expect(mockPostValidate).toHaveBeenCalledWith({
      url,
      hash,
      standard: MetadataStandard.CIP108,
    });
  });

  it("returns MetadataValidationStatus.URL_NOT_FOUND when postValidate throws an error", async () => {
    mockPostValidate.mockRejectedValueOnce(new Error("404 Not Found"));

    const result = await checkIsMissingGAMetadata({ url, hash });

    expect(result).toBe(MetadataValidationStatus.URL_NOT_FOUND);
    expect(mockPostValidate).toHaveBeenCalledWith({
      url,
      hash,
      standard: MetadataStandard.CIP108,
    });
  });
});
