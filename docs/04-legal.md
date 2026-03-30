# Legal Documents

> **Disclaimer:** These are starter drafts. They are not legal advice. Consider having a lawyer review before launch, especially the Terms of Service. That said, our architecture makes privacy compliance unusually simple — we genuinely don't collect or store personal data for static QR codes.

---

## Privacy Policy

### nah Privacy Policy

**Last updated:** [Launch date — TBD]

**The short version:** For static QR codes, we collect nothing. Your data never leaves your browser. For dynamic QR codes, we store only what's necessary to make the redirect work. We don't sell data, we don't run ads, and we don't use tracking cookies.

---

#### What we DON'T collect (static QR codes)

When you use nah to create a static QR code, **all processing happens entirely in your web browser**. The QR code content you enter (URLs, WiFi passwords, contact information, text) is never transmitted to our servers. We have no ability to see, store, or access this data. This is a technical architecture choice, not just a policy promise — the code runs client-side using JavaScript, and you can verify this by viewing our open-source code at https://github.com/vrennat/nah-tools or by using the tool with your internet connection disabled.

Specifically, we do NOT collect:
- The content you encode in QR codes
- Your name, email address, or any personal identifiers
- Your IP address (for the static tool)
- Browser fingerprints, device identifiers, or tracking cookies
- Usage analytics tied to individual users

#### What we DO collect (dynamic QR codes)

If you choose to create a **dynamic QR code** (one where you can change the destination URL after printing), we store the following:

| Data | Purpose | Retention |
|------|---------|-----------|
| Short code (e.g., `abc123`) | Identifies the redirect | Until you delete it |
| Destination URL | Where scans are redirected to | Until you delete it |
| Passphrase hash (bcrypt) | Authenticates management access | Until you delete it |
| Label (optional) | Your name for the code | Until you delete it |
| Scan count (total number) | Basic analytics for you | Until you delete it |
| Creation/update timestamps | Record keeping | Until you delete it |

We do NOT collect from QR code scans:
- Scanner's IP address
- Scanner's location, device type, or browser
- Any personally identifiable information about who scanned the code

The scan counter increments a simple number. We cannot identify who scanned your code, when specifically they scanned it, or where they were.

#### Cloudflare Web Analytics

We use [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/) which operates without client-side JavaScript, cookies, or tracking. It provides aggregate page view counts and performance metrics only. It does not track individual users or collect personal data. Cloudflare's privacy commitments are documented at https://www.cloudflare.com/privacypolicy/.

#### Cookies

We do not use cookies. None. Not for analytics, not for preferences, not for anything.

#### Third-party services

- **Cloudflare**: Hosts our website and processes dynamic QR code redirects. Subject to [Cloudflare's Privacy Policy](https://www.cloudflare.com/privacypolicy/).
- **No other third parties.** We do not use Google Analytics, Facebook Pixel, Hotjar, Intercom, or any other tracking or data collection service.

#### Data location

Dynamic QR code data is stored in Cloudflare's global network using Cloudflare D1 (SQLite). Data may be replicated across Cloudflare's edge locations for performance. Cloudflare's data processing details are available at https://www.cloudflare.com/cloudflare-customer-dpa/.

#### Your rights

- **Delete your dynamic codes**: Enter your passphrase at the management URL to deactivate or delete any dynamic QR code you've created.
- **Data portability**: Your dynamic code data (destination URL, scan count, creation date) is available through the management interface.
- **No account to delete**: We don't create user accounts, so there's no account to delete.

For residents of the EU/EEA (GDPR), California (CCPA/CPRA), and other jurisdictions with data protection laws: because we don't collect personal data for static codes and collect minimal non-personal data for dynamic codes, most data subject rights are satisfied by design. If you believe we hold data about you that you'd like deleted, contact hey@nah.tools.

#### Children's privacy

nah does not knowingly collect any data from children under 13 (or under 16 in the EU). Since we don't collect personal data for static codes and don't require accounts, this is enforced by architecture.

#### Changes to this policy

If we change this policy, we'll update the "Last updated" date and post the changes on this page. For material changes, we'll note them in the GitHub repository's changelog.

#### Contact

Email: hey@nah.tools
GitHub: https://github.com/vrennat/nah-tools

---

## Terms of Service

### nah Terms of Service

**Last updated:** [Launch date — TBD]

#### The plain-language summary

nah is a free, open-source QR code generator. Use it for any lawful purpose. We provide it as-is with no guarantees. Don't use our dynamic code redirect service for spam, malware, or illegal content. That's basically it.

---

#### 1. Acceptance

By using nah, you agree to these terms. If you don't agree, don't use the service.

#### 2. The service

nah provides:
- **Static QR code generation**: Runs entirely in your browser. We provide the code; your device does the work.
- **Dynamic QR code redirects**: An optional service where QR codes point to a short URL on our servers that redirects to your chosen destination.

#### 3. Free and open source

nah is free to use and open-source under the MIT License. You may self-host your own instance at any time. The source code is available at https://github.com/vrennat/nah-tools.

#### 4. Static QR codes

Static QR codes generated by nah encode data directly into the QR pattern. They are not dependent on our servers and will function indefinitely. We make no claim of ownership or control over static QR codes you generate. They are yours.

#### 5. Dynamic QR codes

Dynamic QR codes route through our redirect servers. By using this feature, you agree:

- **No illegal content**: You will not redirect to content that is illegal in your jurisdiction, including but not limited to: malware, phishing pages, child sexual abuse material, or content that facilitates violence.
- **No spam**: You will not use our redirect service to distribute unsolicited bulk communications.
- **No deception**: You will not use our redirect service to mislead users about the destination (e.g., a QR code labeled "restaurant menu" that redirects to a phishing page).
- **We may deactivate codes**: We reserve the right to deactivate any dynamic QR code that violates these terms, is reported as abusive, or is used for illegal purposes.
- **No guaranteed uptime**: While we strive for continuous availability, the dynamic redirect service is provided as-is. We are not liable for downtime, redirect failures, or data loss.
- **Passphrase responsibility**: You are responsible for saving your passphrase. We cannot recover lost passphrases. If you lose your passphrase, you lose management access to your dynamic code.

#### 6. Acceptable use

You may use nah for any lawful purpose, including commercial use. You may not:

- Attempt to overload, disrupt, or attack our servers
- Circumvent rate limits or abuse prevention measures
- Use automated scripts to bulk-create dynamic codes (the static generator has no limits)
- Impersonate nah or misrepresent your affiliation with us
- Reverse-engineer our infrastructure to exploit vulnerabilities

#### 7. Intellectual property

The nah software is licensed under the MIT License. QR codes you generate are yours — we claim no ownership. The QR code standard (ISO/IEC 18004) is open and freely implementable.

#### 8. Disclaimer of warranties

NAH TOOLS IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE. WE DO NOT WARRANT THAT QR CODES GENERATED WILL BE SCANNABLE BY ALL DEVICES IN ALL CONDITIONS.

#### 9. Limitation of liability

TO THE MAXIMUM EXTENT PERMITTED BY LAW, NAH TOOLS AND ITS OPERATORS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE, INCLUDING BUT NOT LIMITED TO LOSS OF BUSINESS, REVENUE, OR DATA.

This includes, without limitation, damages arising from:
- QR codes that are not scannable due to print quality, size, or environmental conditions
- Dynamic code redirect failures or downtime
- Loss of passphrase and inability to manage dynamic codes
- Third-party actions (e.g., someone scanning a code and visiting the linked content)

#### 10. Indemnification

You agree to indemnify and hold harmless nah and its operators from any claims, damages, or expenses arising from your use of the service, including content you link to via dynamic QR codes.

#### 11. Changes to terms

We may update these terms. Continued use after changes constitutes acceptance. Material changes will be noted in the GitHub repository changelog.

#### 12. Governing law

These terms are governed by the laws of California, United States. Any disputes will be resolved in the courts of California, United States.

#### 13. Contact

Email: hey@nah.tools
GitHub: https://github.com/vrennat/nah-tools

---

## Open Source License

### MIT License

The MIT License is the right choice for this project:
- Maximum adoption — anyone can fork, modify, and deploy
- Compatible with the manifesto's values (free tools that last forever)
- No copyleft obligations that might deter business users from contributing
- The same license used by SvelteKit, Svelte, and most of the JS ecosystem

```
MIT License

Copyright (c) 2026 Tanner Vass

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Legal Considerations for the Exposé Article

The `/why` article discusses specific companies (QR Code Generator Pro, Flowcode, Uniqode, etc.) and their business practices. Key considerations:

1. **Stick to verifiable facts**: All claims about pricing, review scores, and business practices should be sourced from public information (pricing pages, Trustpilot, Sitejabber, BBB, SEC filings). Link to sources.

2. **Use review quotes carefully**: Attribute quotes to their public review platforms. Don't modify quotes. Using publicly posted reviews in commentary is generally protected.

3. **Opinion vs. fact**: Clearly distinguish between factual statements ("QR Code Generator Pro has 1.5 stars on Trustpilot from 9,199 reviews") and opinion/analysis ("This business model is predatory"). Opinion and commentary on public business practices are protected speech.

4. **Avoid defamation risk**: Don't make claims you can't verify. Don't accuse specific individuals of crimes unless documented by law enforcement. Focus on business model critique, not personal attacks.

5. **Trademark**: Don't use competitor logos or create confusion that we're affiliated with them. Using their names in comparative commentary and criticism is fair use.

6. **The "QR Code Monkey = same company" claim**: Verify the corporate connection between Egoditor/QR Code Monkey and QR Code Generator Pro through public records (company registrations, domain WHOIS, About pages) before publishing.

---

## Entity Structure (Optional, For Later)

If this grows beyond a side project, consider:

- **LLC**: Limits personal liability. Relatively cheap in most US states (~$100–800/year depending on state). Wyoming and Delaware are popular for online businesses.
- **Not needed at launch**: An individual can operate a free, open-source tool without a business entity. The MIT license and Terms of Service disclaimers provide baseline protection.
- **When to formalize**: If you ever accept donations, if someone threatens legal action, or if the tool processes enough dynamic codes that liability becomes a real concern.
