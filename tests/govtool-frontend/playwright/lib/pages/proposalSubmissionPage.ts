import { faker } from "@faker-js/faker";
import { generateWalletAddress } from "@helpers/cardano";
import { expectWithInfo } from "@helpers/exceptionHandler";
import { downloadMetadata } from "@helpers/metadata";
import { extractProposalIdFromUrl } from "@helpers/string";
import { invalid } from "@mock/index";
import { Download, Page, expect } from "@playwright/test";
import metadataBucketService from "@services/metadataBucketService";
import { ProposalCreateRequest, ProposalLinksType } from "@types";
import environments from "lib/constants/environments";
import ProposalDiscussionPage from "./proposalDiscussionPage";
const formErrors = {
  proposalTitle: ["max-80-characters-error", "this-field-is-required-error"],
  abstract: "this-field-is-required-error",
  motivation: "this-field-is-required-error",
  Rationale: "this-field-is-required-error",
  receivingAddress: "invalid-bech32-address-error",
  amount: ["only-number-is-allowed-error", "this-field-is-required-error"],
  link: "invalid-url-error",
};

export default class ProposalSubmissionPage {
  // modals
  readonly registrationSuccessModal = this.page.getByTestId(
    "governance-action-submitted-modal"
  );
  readonly registrationErrorModal = this.page.getByTestId(
    "create-governance-action-error-modal"
  );

  // buttons
  readonly proposalCreateBtn = this.page.getByRole("button", {
    name: "Propose a Governance Action",
  });
  readonly registerBtn = this.page.getByTestId("register-button");
  readonly skipBtn = this.page.getByTestId("skip-button");
  readonly confirmBtn = this.page.getByTestId("confirm-modal-button");

  readonly continueBtn = this.page.getByRole("button", { name: "Continue" }); //BUG testid = continue-button
  readonly addLinkBtn = this.page.getByRole("button", { name: "Add link" }); // BUG testid= add-link-button
  readonly infoBtn = this.page.getByRole("option", { name: "Info" }); // BUG missing test id
  readonly treasuryBtn = this.page.getByRole("option", { name: "Treasury" }); // BUG missing test id
  readonly editSubmissionButton = this.page.getByTestId(
    "edit-submission-button"
  );
  readonly verifyIdentityBtn = this.page.getByRole("button", {
    name: "Verify your identity",
  });
  readonly governanceActionType = this.page.getByLabel(
    "Governance Action Type *"
  ); // BUG missing test id
  readonly saveDraftBtn = this.page.getByTestId("save-draft-button");

  // input fields
  readonly titleInput = this.page.getByLabel("Title *"); // BUG testid = title-input
  readonly abstractInput = this.page.getByLabel("Abstract *"); // BUG testid = abstract-input
  readonly metadataUrlInput = this.page.getByTestId("metadata-url-input");
  readonly motivationInput = this.page.getByLabel("Motivation *"); // BUG testid = motivation-input
  readonly rationaleInput = this.page.getByLabel("Rationale *"); // BUG testid = rationale-input
  readonly linkInput = this.page.getByLabel("Link #1 URL"); // BUG testid = link-input
  readonly linkText = this.page.getByLabel("Link #1 Text");
  readonly receivingAddressInput = this.page.getByLabel("Receiving address *");
  readonly amountInput = this.page.getByPlaceholder("e.g.");
  readonly closeDraftSuccessModalBtn = this.page.getByTestId(
    "delete-proposal-yes-button"
  ); //BUG Improper test ids

  constructor(private readonly page: Page) {}

  async goto() {
    const proposalDiscussionpage = new ProposalDiscussionPage(this.page);
    await proposalDiscussionpage.goto();
    await this.verifyIdentityBtn.click();

    await this.proposalCreateBtn.click();
  }

  async register(governanceProposal: ProposalCreateRequest) {
    await this.fillupForm(governanceProposal);

    await this.continueBtn.click();
    await this.continueBtn.click();
    await this.page.getByRole("checkbox").click();
    await this.continueBtn.click();

    this.page
      .getByRole("button", {
        name: `${governanceProposal.gov_action_type_id}.jsonld`,
      })
      .click(); // BUG test id = metadata-download-button

    const dRepMetadata = await this.downloadVoteMetadata();
    const url = await metadataBucketService.uploadMetadata(
      dRepMetadata.name,
      dRepMetadata.data
    );
    await this.metadataUrlInput.fill(url);
    await this.continueBtn.click();
  }

  async downloadVoteMetadata() {
    const download: Download = await this.page.waitForEvent("download");
    return downloadMetadata(download);
  }

  async fillupForm(governanceProposal: ProposalCreateRequest) {
    await this.governanceActionType.click();

    if (governanceProposal.gov_action_type_id === 0) {
      await this.infoBtn.click();
    } else {
      await this.treasuryBtn.click();
    }

    await this.fillCommonFields(governanceProposal);

    if (governanceProposal.gov_action_type_id === 1) {
      await this.fillTreasuryFields(governanceProposal);
    }

    if (governanceProposal.proposal_links != null) {
      await this.fillProposalLinks(governanceProposal.proposal_links);
    }
  }

  async fillCommonFields(governanceProposal: ProposalCreateRequest) {
    await this.titleInput.fill(governanceProposal.prop_name);
    await this.abstractInput.fill(governanceProposal.prop_abstract);
    await this.motivationInput.fill(governanceProposal.prop_motivation);
    await this.rationaleInput.fill(governanceProposal.prop_rationale);
  }

  async fillTreasuryFields(governanceProposal: ProposalCreateRequest) {
    await this.receivingAddressInput.fill(
      governanceProposal.prop_receiving_address
    );
    await this.amountInput.fill(governanceProposal.prop_amount);
  }

  async fillProposalLinks(proposal_links: Array<ProposalLinksType>) {
    await this.addLinkBtn.click();
    for (let i = 0; i < proposal_links.length; i++) {
      if (i > 0) {
        await this.addLinkBtn.click();
      }
      await this.linkInput.fill(proposal_links[i].prop_link);
      await this.linkText.fill(proposal_links[i].prop_link_text);
    }
  }

  async validateForm(governanceProposal: ProposalCreateRequest) {
    await this.fillupForm(governanceProposal);

    for (const err of formErrors.proposalTitle) {
      await expect(this.page.getByTestId(err)).toBeHidden();
    }

    expect(await this.abstractInput.textContent()).toEqual(
      governanceProposal.prop_abstract
    );

    expect(await this.rationaleInput.textContent()).toEqual(
      governanceProposal.prop_rationale
    );

    expect(await this.motivationInput.textContent()).toEqual(
      governanceProposal.prop_motivation
    );

    if (governanceProposal.gov_action_type_id === 1) {
      await expect(
        this.page.getByTestId(formErrors.receivingAddress)
      ).toBeHidden();

      for (const err of formErrors.amount) {
        await expect(this.page.getByTestId(err)).toBeHidden();
      }
    }

    await expect(this.page.getByTestId(formErrors.link)).toBeHidden();

    await expect(this.continueBtn).toBeEnabled();
  }

  async inValidateForm(governanceProposal: ProposalCreateRequest) {
    await this.fillupForm(governanceProposal);

    function convertTestIdToText(testId: string) {
      let text = testId.replace("-error", "");
      text = text.replace(/-/g, " ");
      return text[0].toUpperCase() + text.substring(1);
    }

    // Helper function to generate regex pattern from form errors
    function generateRegexPattern(errors: string[]) {
      return new RegExp(errors.map(convertTestIdToText).join("|"));
    }

    // Helper function to get errors based on regex pattern
    async function getErrorsByPattern(page: Page, regexPattern: RegExp) {
      return await page
        .locator('[data-testid$="-error"]')
        .filter({ hasText: regexPattern })
        .all();
    }

    const proposalTitlePattern = generateRegexPattern(formErrors.proposalTitle);
    const proposalTitleErrors = await getErrorsByPattern(
      this.page,
      proposalTitlePattern
    );

    expectWithInfo(
      async () => expect(proposalTitleErrors.length).toEqual(1),
      `valid title: ${governanceProposal.prop_name}`
    );
    if (governanceProposal.gov_action_type_id === 1) {
      const receiverAddressErrors = await getErrorsByPattern(
        this.page,
        new RegExp(convertTestIdToText(formErrors.receivingAddress))
      );

      expectWithInfo(
        async () => expect(receiverAddressErrors.length).toEqual(1),
        `valid address: ${governanceProposal.prop_receiving_address}`
      );

      const amountPattern = generateRegexPattern(formErrors.amount);
      const amountErrors = await getErrorsByPattern(this.page, amountPattern);

      expectWithInfo(
        async () => expect(amountErrors.length).toEqual(1),
        `valid amount: ${governanceProposal.prop_amount}`
      );
    }

    expectWithInfo(
      async () =>
        expect(await this.abstractInput.textContent()).not.toEqual(
          governanceProposal.prop_abstract
        ),
      `valid abstract: ${governanceProposal.prop_abstract}`
    );

    expectWithInfo(
      async () =>
        expect(await this.abstractInput.textContent()).not.toEqual(
          governanceProposal.prop_motivation
        ),
      `valid motivation: ${governanceProposal.prop_motivation}`
    );

    expectWithInfo(
      async () =>
        expect(await this.abstractInput.textContent()).not.toEqual(
          governanceProposal.prop_rationale
        ),
      `valid rationale: ${governanceProposal.prop_rationale}`
    );

    expectWithInfo(
      async () =>
        await expect(this.page.getByTestId(formErrors.link)).toBeVisible(),
      `valid link: ${governanceProposal.proposal_links[0].prop_link}`
    );

    await expect(this.continueBtn).toBeDisabled();
  }

  generateValidProposalFormFields(
    proposalType: number,
    is_draft?: boolean,
    receivingAddress?: string
  ) {
    const proposal: ProposalCreateRequest = {
      prop_name: faker.lorem.sentence(6),
      prop_abstract: faker.lorem.paragraph(2),
      prop_motivation: faker.lorem.paragraphs(2),
      prop_rationale: faker.lorem.paragraphs(2),

      proposal_links: [
        {
          prop_link: faker.internet.url(),
          prop_link_text: faker.internet.domainWord(),
        },
      ],
      gov_action_type_id: proposalType,
      is_draft: !!is_draft,
    };
    if (proposalType === proposal.gov_action_type_id) {
      (proposal.prop_receiving_address = receivingAddress),
        (proposal.prop_amount = faker.number
          .int({ min: 100, max: 1000 })
          .toString());
    }
    return proposal;
  }

  generateInValidProposalFormFields(govActionTypeId: number) {
    const proposal: ProposalCreateRequest = {
      prop_name: invalid.proposalTitle(),
      prop_abstract: invalid.paragraph(),
      prop_motivation: invalid.paragraph(),
      prop_rationale: invalid.paragraph(),

      proposal_links: [
        {
          prop_link: invalid.url(),
          prop_link_text: invalid.name(),
        },
      ],
      gov_action_type_id: govActionTypeId,
      is_draft: false,
    };
    if (govActionTypeId === 1) {
      (proposal.prop_receiving_address = faker.location.streetAddress()),
        (proposal.prop_amount = invalid.amount());
    }
    return proposal;
  }

  async createProposal(): Promise<number> {
    const receivingAddr = generateWalletAddress();
    const proposalRequest: ProposalCreateRequest = {
      proposal_links: [
        {
          prop_link: faker.internet.url(),
          prop_link_text: faker.internet.displayName(),
        },
      ],
      gov_action_type_id: 1,
      prop_name: faker.company.name(),
      prop_abstract: faker.lorem.paragraph(2),
      prop_motivation: faker.lorem.paragraph(2),
      prop_rationale: faker.lorem.paragraph(2),
      prop_receiving_address: receivingAddr,
      prop_amount: faker.number.int({ min: 100, max: 1000 }).toString(),
      is_draft: false,
    };

    await this.proposalCreateBtn.click();
    await this.continueBtn.click();

    await this.validateForm(proposalRequest);
    await this.continueBtn.click();
    await this.page.getByRole("button", { name: "Submit" }).click();

    // Wait for redirection to `proposal-discussion-details` page
    await this.page.waitForTimeout(2_000);

    const currentPageUrl = this.page.url();
    return extractProposalIdFromUrl(currentPageUrl);
  }
}
