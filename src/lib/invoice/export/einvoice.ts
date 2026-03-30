import type { InvoiceData } from '../types';
import { calculateInvoiceSummary } from '../calculations';
import { getCurrency } from '../currency';

function escapeXml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

function xmlDate(dateStr: string): string {
	// YYYY-MM-DD is already ISO format
	return dateStr || new Date().toISOString().slice(0, 10);
}

// ──── ZUGFeRD / Factur-X (MINIMUM profile, CII format) ────

export function generateZUGFeRD(invoice: InvoiceData): string {
	const summary = calculateInvoiceSummary(invoice);
	const currency = getCurrency(invoice.currency);
	const dec = currency.decimals;

	const typeCode = invoice.documentType === 'credit_note' ? '381' : '380'; // 380 = invoice, 381 = credit note

	let lineXml = '';
	const sorted = [...invoice.lineItems].sort((a, b) => a.sortOrder - b.sortOrder);
	sorted.forEach((item, idx) => {
		const result = summary.lineResults.get(item.id);
		const amount = result?.amount ?? 0;

		lineXml += `
    <ram:IncludedSupplyChainTradeLineItem>
      <ram:AssociatedDocumentLineDocument>
        <ram:LineID>${idx + 1}</ram:LineID>
      </ram:AssociatedDocumentLineDocument>
      <ram:SpecifiedTradeProduct>
        <ram:Name>${escapeXml(item.description || 'Item')}</ram:Name>
      </ram:SpecifiedTradeProduct>
      <ram:SpecifiedLineTradeAgreement>
        <ram:NetPriceProductTradePrice>
          <ram:ChargeAmount>${item.unitPrice.toFixed(dec)}</ram:ChargeAmount>
        </ram:NetPriceProductTradePrice>
      </ram:SpecifiedLineTradeAgreement>
      <ram:SpecifiedLineTradeDelivery>
        <ram:BilledQuantity unitCode="C62">${item.quantity}</ram:BilledQuantity>
      </ram:SpecifiedLineTradeDelivery>
      <ram:SpecifiedLineTradeSettlement>
        <ram:SpecifiedTradeSettlementLineMonetarySummation>
          <ram:LineTotalAmount>${amount.toFixed(dec)}</ram:LineTotalAmount>
        </ram:SpecifiedTradeSettlementLineMonetarySummation>
      </ram:SpecifiedLineTradeSettlement>
    </ram:IncludedSupplyChainTradeLineItem>`;
	});

	let taxXml = '';
	if (summary.taxLines.length > 0) {
		for (const tax of summary.taxLines) {
			taxXml += `
        <ram:ApplicableTradeTax>
          <ram:CalculatedAmount>${tax.amount.toFixed(dec)}</ram:CalculatedAmount>
          <ram:TypeCode>VAT</ram:TypeCode>
          <ram:BasisAmount>${summary.afterDiscount.toFixed(dec)}</ram:BasisAmount>
          <ram:CategoryCode>${invoice.taxConfig.reverseCharge ? 'AE' : 'S'}</ram:CategoryCode>
          <ram:RateApplicablePercent>${tax.rate}</ram:RateApplicablePercent>
        </ram:ApplicableTradeTax>`;
		}
	} else {
		taxXml = `
        <ram:ApplicableTradeTax>
          <ram:CalculatedAmount>0.00</ram:CalculatedAmount>
          <ram:TypeCode>VAT</ram:TypeCode>
          <ram:BasisAmount>${summary.afterDiscount.toFixed(dec)}</ram:BasisAmount>
          <ram:CategoryCode>O</ram:CategoryCode>
          <ram:RateApplicablePercent>0</ram:RateApplicablePercent>
        </ram:ApplicableTradeTax>`;
	}

	return `<?xml version="1.0" encoding="UTF-8"?>
<rsm:CrossIndustryInvoice xmlns:rsm="urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100"
  xmlns:ram="urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100"
  xmlns:udt="urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100"
  xmlns:qdt="urn:un:unece:uncefact:data:standard:QualifiedDataType:100">
  <rsm:ExchangedDocumentContext>
    <ram:GuidelineSpecifiedDocumentContextParameter>
      <ram:ID>urn:factur-x.eu:1p0:minimum</ram:ID>
    </ram:GuidelineSpecifiedDocumentContextParameter>
  </rsm:ExchangedDocumentContext>
  <rsm:ExchangedDocument>
    <ram:ID>${escapeXml(invoice.documentNumber || 'DRAFT')}</ram:ID>
    <ram:TypeCode>${typeCode}</ram:TypeCode>
    <ram:IssueDateTime>
      <udt:DateTimeString format="102">${xmlDate(invoice.issueDate).replace(/-/g, '')}</udt:DateTimeString>
    </ram:IssueDateTime>
  </rsm:ExchangedDocument>
  <rsm:SupplyChainTradeTransaction>${lineXml}
    <ram:ApplicableHeaderTradeAgreement>
      <ram:SellerTradeParty>
        <ram:Name>${escapeXml(invoice.sender.name || 'Seller')}</ram:Name>
        <ram:PostalTradeAddress>
          <ram:PostcodeCode>${escapeXml(invoice.sender.postalCode)}</ram:PostcodeCode>
          <ram:LineOne>${escapeXml(invoice.sender.address)}</ram:LineOne>
          <ram:CityName>${escapeXml(invoice.sender.city)}</ram:CityName>
          <ram:CountryID>${escapeXml(invoice.sender.country || 'US')}</ram:CountryID>
        </ram:PostalTradeAddress>${invoice.sender.taxId ? `
        <ram:SpecifiedTaxRegistration>
          <ram:ID schemeID="VA">${escapeXml(invoice.sender.taxId)}</ram:ID>
        </ram:SpecifiedTaxRegistration>` : ''}
      </ram:SellerTradeParty>
      <ram:BuyerTradeParty>
        <ram:Name>${escapeXml(invoice.client.name || 'Buyer')}</ram:Name>
        <ram:PostalTradeAddress>
          <ram:PostcodeCode>${escapeXml(invoice.client.postalCode)}</ram:PostcodeCode>
          <ram:LineOne>${escapeXml(invoice.client.address)}</ram:LineOne>
          <ram:CityName>${escapeXml(invoice.client.city)}</ram:CityName>
          <ram:CountryID>${escapeXml(invoice.client.country || 'US')}</ram:CountryID>
        </ram:PostalTradeAddress>${invoice.client.taxId ? `
        <ram:SpecifiedTaxRegistration>
          <ram:ID schemeID="VA">${escapeXml(invoice.client.taxId)}</ram:ID>
        </ram:SpecifiedTaxRegistration>` : ''}
      </ram:BuyerTradeParty>
    </ram:ApplicableHeaderTradeAgreement>
    <ram:ApplicableHeaderTradeDelivery/>
    <ram:ApplicableHeaderTradeSettlement>
      <ram:InvoiceCurrencyCode>${invoice.currency}</ram:InvoiceCurrencyCode>${invoice.dueDate ? `
      <ram:SpecifiedTradePaymentTerms>
        <ram:DueDateDateTime>
          <udt:DateTimeString format="102">${xmlDate(invoice.dueDate).replace(/-/g, '')}</udt:DateTimeString>
        </ram:DueDateDateTime>
      </ram:SpecifiedTradePaymentTerms>` : ''}${taxXml}
      <ram:SpecifiedTradeSettlementHeaderMonetarySummation>
        <ram:LineTotalAmount>${summary.subtotals.total.toFixed(dec)}</ram:LineTotalAmount>
        <ram:TaxBasisTotalAmount>${summary.afterDiscount.toFixed(dec)}</ram:TaxBasisTotalAmount>
        <ram:TaxTotalAmount currencyID="${invoice.currency}">${summary.totalTax.toFixed(dec)}</ram:TaxTotalAmount>
        <ram:GrandTotalAmount>${summary.total.toFixed(dec)}</ram:GrandTotalAmount>
        <ram:DuePayableAmount>${summary.total.toFixed(dec)}</ram:DuePayableAmount>
      </ram:SpecifiedTradeSettlementHeaderMonetarySummation>
    </ram:ApplicableHeaderTradeSettlement>
  </rsm:SupplyChainTradeTransaction>
</rsm:CrossIndustryInvoice>`;
}

// ──── UBL 2.1 ────

export function generateUBL(invoice: InvoiceData): string {
	const summary = calculateInvoiceSummary(invoice);
	const currency = getCurrency(invoice.currency);
	const dec = currency.decimals;

	const docType = invoice.documentType === 'credit_note' ? 'CreditNote' : 'Invoice';

	let lineXml = '';
	const sorted = [...invoice.lineItems].sort((a, b) => a.sortOrder - b.sortOrder);
	sorted.forEach((item, idx) => {
		const result = summary.lineResults.get(item.id);
		const amount = result?.amount ?? 0;

		lineXml += `
  <cac:${docType}Line>
    <cbc:ID>${idx + 1}</cbc:ID>
    <cbc:${docType === 'CreditNote' ? 'CreditedQuantity' : 'InvoicedQuantity'} unitCode="C62">${item.quantity}</${docType === 'CreditNote' ? 'cbc:CreditedQuantity' : 'cbc:InvoicedQuantity'}>
    <cbc:LineExtensionAmount currencyID="${invoice.currency}">${amount.toFixed(dec)}</cbc:LineExtensionAmount>
    <cac:Item>
      <cbc:Name>${escapeXml(item.description || 'Item')}</cbc:Name>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="${invoice.currency}">${item.unitPrice.toFixed(dec)}</cbc:PriceAmount>
    </cac:Price>
  </cac:${docType}Line>`;
	});

	function partyXml(contact: typeof invoice.sender, role: string): string {
		return `
  <cac:${role}>
    <cac:Party>
      <cac:PartyName>
        <cbc:Name>${escapeXml(contact.name || role)}</cbc:Name>
      </cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>${escapeXml(contact.address)}</cbc:StreetName>
        <cbc:CityName>${escapeXml(contact.city)}</cbc:CityName>
        <cbc:PostalZone>${escapeXml(contact.postalCode)}</cbc:PostalZone>
        <cac:Country>
          <cbc:IdentificationCode>${escapeXml(contact.country || 'US')}</cbc:IdentificationCode>
        </cac:Country>
      </cac:PostalAddress>${contact.taxId ? `
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${escapeXml(contact.taxId)}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>` : ''}
      <cac:Contact>
        <cbc:ElectronicMail>${escapeXml(contact.email)}</cbc:ElectronicMail>${contact.phone ? `
        <cbc:Telephone>${escapeXml(contact.phone)}</cbc:Telephone>` : ''}
      </cac:Contact>
    </cac:Party>
  </cac:${role}>`;
	}

	let taxTotalXml = '';
	if (summary.taxLines.length > 0) {
		const subtotals = summary.taxLines.map(
			(t) => `
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="${invoice.currency}">${summary.afterDiscount.toFixed(dec)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="${invoice.currency}">${t.amount.toFixed(dec)}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:ID>${invoice.taxConfig.reverseCharge ? 'AE' : 'S'}</cbc:ID>
        <cbc:Percent>${t.rate}</cbc:Percent>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>`
		).join('');

		taxTotalXml = `
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${invoice.currency}">${summary.totalTax.toFixed(dec)}</cbc:TaxAmount>${subtotals}
  </cac:TaxTotal>`;
	}

	return `<?xml version="1.0" encoding="UTF-8"?>
<${docType} xmlns="urn:oasis:names:specification:ubl:schema:xsd:${docType}-2"
  xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
  xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:ID>${escapeXml(invoice.documentNumber || 'DRAFT')}</cbc:ID>
  <cbc:IssueDate>${xmlDate(invoice.issueDate)}</cbc:IssueDate>${invoice.dueDate ? `
  <cbc:DueDate>${xmlDate(invoice.dueDate)}</cbc:DueDate>` : ''}
  <cbc:${docType}TypeCode>${invoice.documentType === 'credit_note' ? '381' : '380'}</cbc:${docType}TypeCode>
  <cbc:DocumentCurrencyCode>${invoice.currency}</cbc:DocumentCurrencyCode>${invoice.notes ? `
  <cbc:Note>${escapeXml(invoice.notes)}</cbc:Note>` : ''}${partyXml(invoice.sender, 'AccountingSupplierParty')}${partyXml(invoice.client, 'AccountingCustomerParty')}${taxTotalXml}
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="${invoice.currency}">${summary.subtotals.total.toFixed(dec)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="${invoice.currency}">${summary.afterDiscount.toFixed(dec)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="${invoice.currency}">${summary.total.toFixed(dec)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="${invoice.currency}">${summary.total.toFixed(dec)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>${lineXml}
</${docType}>`;
}
