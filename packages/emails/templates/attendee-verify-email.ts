import { APP_NAME, COMPANY_NAME, EMAIL_FROM_NAME } from "@calcom/lib/constants";

import type { EmailVerifyCode } from "../lib/types/email-types";
import renderEmail from "../src/renderEmail";
import BaseEmail from "./_base-email";

export type { EmailVerifyCode } from "../lib/types/email-types";

export default class AttendeeVerifyEmail extends BaseEmail {
  verifyAccountInput: EmailVerifyCode;

  constructor(passwordEvent: EmailVerifyCode) {
    super();
    this.name = "SEND_ACCOUNT_VERIFY_EMAIL";
    this.verifyAccountInput = passwordEvent;
  }

  protected async getNodeMailerPayload(): Promise<Record<string, unknown>> {
    return {
      to: `${this.verifyAccountInput.user.name} <${this.verifyAccountInput.user.email}>`,
      from: `${EMAIL_FROM_NAME} <${this.getMailerOptions().from}>`,
      subject: this.getSubject(),
      html: await renderEmail("VerifyEmailByCode", this.verifyAccountInput),
      text: this.getTextBody(),
    };
  }

  private getSubject(): string {
    const { language, hideLogo, isVerifyingEmail, isBookingVerification, hostName } =
      this.verifyAccountInput;
    if (isBookingVerification) return language("booker_verify_email_subject", { hostName });
    return hideLogo
      ? language("verify_email_subject_no_branding")
      : language(`verify_email_subject${isVerifyingEmail ? "_verifying_email" : ""}`, { appName: APP_NAME });
  }

  protected getTextBody(): string {
    const subject = this.getSubject();
    const { isBookingVerification, hostName } = this.verifyAccountInput;
    if (isBookingVerification) {
      const t = this.verifyAccountInput.language;
      return `
${t("booker_verify_email_header")}
${t("hi_user_name", { name: this.verifyAccountInput.user.name })},
${t("booker_verify_email_body", { hostName })}
${this.verifyAccountInput.verificationEmailCode}
${t("booker_verify_email_footer")}
`.replace(/(<([^>]+)>)/gi, "");
    }

    const footer = this.verifyAccountInput.hideLogo
      ? ""
      : `${this.verifyAccountInput.language("happy_scheduling")} ${this.verifyAccountInput.language(
          "the_calcom_team",
          { companyName: COMPANY_NAME }
        )}`;

    return `
${subject}
${this.verifyAccountInput.language("verify_email_email_header")}
${this.verifyAccountInput.language("hi_user_name", { name: this.verifyAccountInput.user.name })},
${this.verifyAccountInput.language("verify_email_by_code_email_body")}
${this.verifyAccountInput.verificationEmailCode}
${footer}
`.replace(/(<([^>]+)>)/gi, "");
  }
}
