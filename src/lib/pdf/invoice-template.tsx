
// GST-compliant invoice PDF template using @react-pdf/renderer

import {
  Document, Page, Text, View, StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page:        { fontFamily: "Helvetica", fontSize: 10, padding: 40, color: "#1a1a1a" },
  header:      { flexDirection: "row", justifyContent: "space-between", marginBottom: 30 },
  brand:       { fontSize: 22, fontFamily: "Helvetica-Bold", color: "#4f46e5" },
  brandSub:    { fontSize: 9, color: "#6b7280", marginTop: 2 },
  invoiceTitle:{ fontSize: 18, fontFamily: "Helvetica-Bold", color: "#1a1a1a", textAlign: "right" },
  invoiceMeta: { fontSize: 9, color: "#6b7280", textAlign: "right", marginTop: 2 },
  divider:     { borderBottom: "1 solid #e5e7eb", marginVertical: 16 },
  section:     { marginBottom: 16 },
  sectionTitle:{ fontSize: 9, fontFamily: "Helvetica-Bold", color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 },
  row:         { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  label:       { fontSize: 9, color: "#6b7280" },
  value:       { fontSize: 9, fontFamily: "Helvetica-Bold" },
  tableHeader: { flexDirection: "row", backgroundColor: "#f3f4f6", padding: "8 6", borderRadius: 4, marginBottom: 2 },
  tableRow:    { flexDirection: "row", padding: "6 6", borderBottom: "1 solid #f3f4f6" },
  thCell:      { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#374151" },
  tdCell:      { fontSize: 9, color: "#374151" },
  totalsBox:   { backgroundColor: "#f9fafb", borderRadius: 6, padding: 12, marginTop: 12 },
  totalRow:    { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  totalLabel:  { fontSize: 9, color: "#6b7280" },
  totalValue:  { fontSize: 9 },
  grandTotal:  { flexDirection: "row", justifyContent: "space-between", borderTop: "1 solid #e5e7eb", paddingTop: 8, marginTop: 4 },
  grandLabel:  { fontSize: 12, fontFamily: "Helvetica-Bold" },
  grandValue:  { fontSize: 12, fontFamily: "Helvetica-Bold", color: "#4f46e5" },
  footer:      { marginTop: 40, textAlign: "center", fontSize: 8, color: "#9ca3af" },
  badge:       { backgroundColor: "#dcfce7", color: "#15803d", padding: "3 8", borderRadius: 4, fontSize: 8, fontFamily: "Helvetica-Bold" },
  termsBox:    { backgroundColor: "#fefce8", borderRadius: 6, padding: 10, marginTop: 12 },
  termsText:   { fontSize: 8, color: "#713f12", lineHeight: 1.5 },
  bankBox:     { backgroundColor: "#eff6ff", borderRadius: 6, padding: 10, marginTop: 8 },
  bankText:    { fontSize: 8, color: "#1e40af" },
});

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

export type InvoiceData = {
  invoiceNumber:  string;
  invoiceDate:    string;
  dueDate?:       string;
  vendor: {
    businessName: string;
    address:      string;
    city:         string;
    state:        string;
    pincode:      string;
    gstin?:       string;
    pan?:         string;
    phone?:       string;
    email?:       string;
    bankName?:    string;
    bankAccountNo?: string;
    bankIfsc?:    string;
  };
  customer: {
    name:    string;
    email:   string;
    phone?:  string;
    address?: string;
  };
  event: {
    title:     string;
    eventDate: string;
    city?:     string;
  };
  lineItems: Array<{
    description: string;
    quantity:    number;
    unitPrice:   number;
    total:       number;
  }>;
  subtotal:    number;
  gstRate:     number;
  gstAmount:   number;
  totalAmount: number;
  notes?:      string;
  terms?:      string;
  isPaid?:     boolean;
};

export function InvoiceDocument({ data }: { data: InvoiceData }) {
  return (
    <Document title={`Invoice ${data.invoiceNumber}`} author="EventSync">
      <Page size="A4" style={styles.page}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>EventSync</Text>
            <Text style={styles.brandSub}>Event Operations & Vendor Management</Text>
          </View>
          <View>
            <Text style={styles.invoiceTitle}>TAX INVOICE</Text>
            <Text style={styles.invoiceMeta}>#{data.invoiceNumber}</Text>
            <Text style={styles.invoiceMeta}>Date: {formatDate(data.invoiceDate)}</Text>
            {data.dueDate && <Text style={styles.invoiceMeta}>Due: {formatDate(data.dueDate)}</Text>}
            {data.isPaid && <Text style={[styles.badge, { marginTop: 4 }]}>✓ PAID</Text>}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Vendor + Customer */}
        <View style={[styles.row, { alignItems: "flex-start" }]}>
          <View style={{ flex: 1, marginRight: 20 }}>
            <Text style={styles.sectionTitle}>From (Vendor)</Text>
            <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", marginBottom: 3 }}>{data.vendor.businessName}</Text>
            <Text style={styles.label}>{data.vendor.address}</Text>
            <Text style={styles.label}>{data.vendor.city}, {data.vendor.state} — {data.vendor.pincode}</Text>
            {data.vendor.gstin && <Text style={[styles.label, { marginTop: 4 }]}>GSTIN: {data.vendor.gstin}</Text>}
            {data.vendor.pan   && <Text style={styles.label}>PAN: {data.vendor.pan}</Text>}
            {data.vendor.phone && <Text style={styles.label}>Ph: {data.vendor.phone}</Text>}
            {data.vendor.email && <Text style={styles.label}>{data.vendor.email}</Text>}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Bill To (Customer)</Text>
            <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", marginBottom: 3 }}>{data.customer.name}</Text>
            {data.customer.address && <Text style={styles.label}>{data.customer.address}</Text>}
            <Text style={styles.label}>{data.customer.email}</Text>
            {data.customer.phone && <Text style={styles.label}>Ph: {data.customer.phone}</Text>}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Event info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Event</Text>
            <Text style={styles.value}>{data.event.title}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Event Date</Text>
            <Text style={styles.value}>{formatDate(data.event.eventDate)}</Text>
          </View>
          {data.event.city && (
            <View style={styles.row}>
              <Text style={styles.label}>Location</Text>
              <Text style={styles.value}>{data.event.city}</Text>
            </View>
          )}
        </View>

        {/* Line items table */}
        <Text style={styles.sectionTitle}>Services</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.thCell, { flex: 4 }]}>Description</Text>
          <Text style={[styles.thCell, { flex: 1, textAlign: "center" }]}>Qty</Text>
          <Text style={[styles.thCell, { flex: 2, textAlign: "right" }]}>Unit Price</Text>
          <Text style={[styles.thCell, { flex: 2, textAlign: "right" }]}>Total</Text>
        </View>
        {data.lineItems.map((item, idx) => (
          <View key={idx} style={styles.tableRow}>
            <Text style={[styles.tdCell, { flex: 4 }]}>{item.description}</Text>
            <Text style={[styles.tdCell, { flex: 1, textAlign: "center" }]}>{item.quantity}</Text>
            <Text style={[styles.tdCell, { flex: 2, textAlign: "right" }]}>{formatCurrency(item.unitPrice)}</Text>
            <Text style={[styles.tdCell, { flex: 2, textAlign: "right" }]}>{formatCurrency(item.total)}</Text>
          </View>
        ))}

        {/* Totals */}
        <View style={styles.totalsBox}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatCurrency(data.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>GST ({data.gstRate}%)</Text>
            <Text style={styles.totalValue}>{formatCurrency(data.gstAmount)}</Text>
          </View>
          <View style={styles.grandTotal}>
            <Text style={styles.grandLabel}>Total Amount</Text>
            <Text style={styles.grandValue}>{formatCurrency(data.totalAmount)}</Text>
          </View>
        </View>

        {/* Bank details */}
        {data.vendor.bankAccountNo && (
          <View style={styles.bankBox}>
            <Text style={[styles.sectionTitle, { color: "#1e40af", marginBottom: 4 }]}>Bank Details</Text>
            <Text style={styles.bankText}>Bank: {data.vendor.bankName}</Text>
            <Text style={styles.bankText}>Account No: {data.vendor.bankAccountNo}</Text>
            <Text style={styles.bankText}>IFSC: {data.vendor.bankIfsc}</Text>
          </View>
        )}

        {/* Notes */}
        {data.notes && (
          <View style={[styles.section, { marginTop: 12 }]}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={{ fontSize: 9, color: "#374151", lineHeight: 1.5 }}>{data.notes}</Text>
          </View>
        )}

        {/* Terms */}
        {data.terms && (
          <View style={styles.termsBox}>
            <Text style={[styles.sectionTitle, { color: "#713f12", marginBottom: 4 }]}>Terms & Conditions</Text>
            <Text style={styles.termsText}>{data.terms}</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by EventSync · This is a computer-generated invoice · No signature required
        </Text>

      </Page>
    </Document>
  );
}