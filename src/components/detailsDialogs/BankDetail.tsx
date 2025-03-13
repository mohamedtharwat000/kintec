import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useContractor } from "@/hooks/useContractor";

interface BankDetailDetailsProps {
  bankDetail: {
    bank_detail_id: string;
    contractor_id: string;
    bank_name: string;
    account_number: string;
    IBAN: string;
    SWIFT: string;
    currency: string;
    bank_detail_type: string;
    bank_detail_validated: boolean;
    last_updated: string;
  };
  open: boolean;
  onClose: () => void;
}

export function BankDetailDetails({
  bankDetail,
  open,
  onClose,
}: BankDetailDetailsProps) {
  const { data: contractor } = useContractor(bankDetail.contractor_id);

  const formatDate = (date: string | undefined) => {
    if (!date) return "N/A";
    try {
      return format(new Date(date), "MMM d, yyyy 'at' h:mm a");
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bank Account Details</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-1 divide-y">
              <div className="px-4 py-3 bg-muted/30 flex justify-between items-center">
                <span className="text-sm font-medium">Account ID</span>
                <span className="text-sm font-mono">
                  {bankDetail.bank_detail_id}
                </span>
              </div>

              {/* New Contractor ID Field */}
              <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-medium">Contractor ID</span>
                <span className="text-sm font-mono">
                  {bankDetail.contractor_id}
                </span>
              </div>

              <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-medium">Contractor</span>
                <span className="text-sm">
                  {contractor
                    ? `${contractor.first_name} ${contractor.last_name}`
                    : "Loading..."}
                </span>
              </div>

              <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-medium">Bank Name</span>
                <span className="text-sm">{bankDetail.bank_name}</span>
              </div>

              <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-medium">Account Number</span>
                <span className="text-sm font-mono">
                  {bankDetail.account_number}
                </span>
              </div>

              <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-medium">IBAN</span>
                <span className="text-sm font-mono">{bankDetail.IBAN}</span>
              </div>

              <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-medium">SWIFT/BIC</span>
                <span className="text-sm font-mono">{bankDetail.SWIFT}</span>
              </div>

              <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-medium">Currency</span>
                <span className="text-sm">{bankDetail.currency}</span>
              </div>

              <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-medium">Account Type</span>
                <Badge variant="outline" className="capitalize">
                  {bankDetail.bank_detail_type}
                </Badge>
              </div>

              <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-medium">Validation Status</span>
                <Badge
                  variant={
                    bankDetail.bank_detail_validated ? "default" : "secondary"
                  }
                >
                  {bankDetail.bank_detail_validated
                    ? "Validated"
                    : "Not Validated"}
                </Badge>
              </div>

              <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-medium">Last Updated</span>
                <span className="text-sm">
                  {formatDate(bankDetail.last_updated)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
