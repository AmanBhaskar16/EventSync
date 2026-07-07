
// GET — generate and stream GST invoice PDF

import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { InvoiceDocument, type InvoiceData } from "@/lib/pdf/invoice-template";
import React from "react";

export const dynamic = "force-dynamic";

export const GET = async (
  _req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) => {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ 
      success: false, 
      error: "Unauthenticated." 
    }, { status: 401 });

    const { bookingId } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true, 
        agreedPrice: true, 
        status: true, 
        createdAt: true,
        event: {
          select: {
            title: true, 
            eventDate: true, 
            city: true,
            customer: {
              select: {
                  user: { select: { 
                    name: true, 
                    email: true, 
                    phone: true 
                  } 
                },
              },
            },
          },
        },
        vendor: {
          select: {
            businessName: true, 
            city: true, 
            state: true, 
            pincode: true,
            gstin: true, 
            pan: true, 
            bankName: true, 
            bankAccountNo: true, 
            bankIfsc: true,
            user: { 
              select: { 
                email: true, 
                phone: true 
              } 
            },
          },
        },
        quotes: {
          where:   { status: "ACCEPTED" },
          orderBy: { version: "desc" },
          take:    1,
          select: {
            lineItems: true, 
            subtotal: true,
            gstRate: true, 
            gstAmount: true, 
            totalAmount: true,
            notes: true, 
            terms: true,
          },
        },
        payments: {
          select: { status: true },
        },
      },
    });

    if (!booking) return NextResponse.json({ 
      success: false, 
      error: "Booking not found." 
    }, { status: 404 });

    const b = booking  as Record<string, unknown>;
    const event  = b.event  as Record<string, unknown>;
    const vendor = b.vendor as Record<string, unknown> & { user: Record<string, unknown> };
    const custR  = (event.customer as Record<string, unknown>).user as Record<string, unknown>;
    const vendU  = vendor.user;
    const quotes = b.quotes as Array<Record<string, unknown>>;
    const q = quotes[0];

    if (!q) return NextResponse.json({ 
      success: false, 
      error: "No accepted quote found." 
    }, { status: 400 });

    const payments = b.payments as Array<{ status: string }>;
    const allPaid  = payments.length > 0 && payments.every((p) => p.status === "PAID");

    type LineItem = { 
      description: string; 
      quantity: number; 
      unitPrice: number; 
      total: number 
    };

    const invoiceData: InvoiceData = {
      invoiceNumber: `INV-${bookingId.slice(-8).toUpperCase()}`,
      invoiceDate:   (b.createdAt as Date).toISOString(),
      vendor: {
        businessName:  vendor.businessName  as string,
        address: "",
        city:  vendor.city  as string,
        state: vendor.state  as string,
        pincode: vendor.pincode as string,
        gstin: vendor.gstin as string | undefined,
        pan: vendor.pan as string | undefined,
        phone: vendU.phone as string | undefined,
        email: vendU.email as string | undefined,
        bankName: vendor.bankName as string | undefined,
        bankAccountNo: vendor.bankAccountNo as string | undefined,
        bankIfsc: vendor.bankIfsc as string | undefined,
      },
      customer: {
        name:  custR.name  as string,
        email: custR.email as string,
        phone: custR.phone as string | undefined,
      },
      event: {
        title: event.title as string,
        eventDate: (event.eventDate as Date).toISOString(),
        city: event.city as string | undefined,
      },
      lineItems: q.lineItems as LineItem[],
      subtotal: q.subtotal as number,
      gstRate: q.gstRate as number,
      gstAmount: q.gstAmount as number,
      totalAmount: q.totalAmount as number,
      notes: q.notes as string | undefined,
      terms: q.terms as string | undefined,
      isPaid: allPaid,
    };

    // renderToBuffer expects a React element with Document as root
    const element = React.createElement(InvoiceDocument, { data: invoiceData });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(element as any);

    return new NextResponse(Buffer.from(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${invoiceData.invoiceNumber}.pdf"`,
        "Content-Length": String(buffer.byteLength),
      },
    });
    
  } catch (err) {

    console.error("[GENERATE_INVOICE]", err);

    return NextResponse.json({ 
      success: false, 
      error: "Failed to generate invoice." 
    }, { status: 500 });
  }
}