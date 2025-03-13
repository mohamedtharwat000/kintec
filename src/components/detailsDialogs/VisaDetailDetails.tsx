import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useContractor } from "@/hooks/useContractor";
import { format } from "date-fns";
import { VisaDetail } from "@/types/VisaDetail";

interface VisaDetailDetailsProps {
  visaDetail: VisaDetail;
  open: boolean;
  onClose: () => void;
}

export function VisaDetailDetails({
  visaDetail,
  open,
  onClose,
}: VisaDetailDetailsProps) {
  const { data: contractor } = useContractor(visaDetail.contractor_id);

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return "N/A";
    try {
      return format(new Date(date), "MMM d, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "default"; // green
      case "expired":
        return "secondary"; // gray
      case "revoked":
        return "destructive"; // red
      default:
        return "outline";
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Visa & ID Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-1 divide-y">
              <div className="px-4 py-3 bg-muted/30 flex justify-between items-center">
                <span className="text-sm font-medium">Visa ID</span>
                <span className="text-sm font-mono">
                  {visaDetail.visa_detail_id}
                </span>
              </div>

              <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-medium">Contractor ID</span>
                <span className="text-sm font-mono">
                  {visaDetail.contractor_id}
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

              <div className="px-4 py-3 bg-muted/30 flex justify-between items-center">
                <span className="text-sm font-semibold">Visa Information</span>
              </div>

              <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-medium">Visa Number</span>
                <span className="text-sm font-mono">
                  {visaDetail.visa_number}
                </span>
              </div>

              <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-medium">Visa Type</span>
                <span className="text-sm">{visaDetail.visa_type}</span>
              </div>

              <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-medium">Country</span>
                <span className="text-sm">{visaDetail.visa_country}</span>
              </div>

              <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-medium">Visa Status</span>
                <Badge variant={getStatusBadgeVariant(visaDetail.visa_status)}>
                  {visaDetail.visa_status.charAt(0).toUpperCase() +
                    visaDetail.visa_status.slice(1)}
                </Badge>
              </div>

              <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-medium">Expiry Date</span>
                <span className="text-sm">
                  {formatDate(visaDetail.visa_expiry_date)}
                </span>
              </div>

              <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-medium">Visa Sponsor</span>
                <span className="text-sm">
                  {visaDetail.visa_sponsor || "N/A"}
                </span>
              </div>

              <div className="px-4 py-3 bg-muted/30 flex justify-between items-center">
                <span className="text-sm font-semibold">ID Information</span>
              </div>

              <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-medium">ID Type</span>
                <span className="text-sm capitalize">
                  {visaDetail.country_id_type.replace("_", " ")}
                </span>
              </div>

              <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-medium">ID Number</span>
                <span className="text-sm font-mono">
                  {visaDetail.country_id_number}
                </span>
              </div>

              <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-medium">ID Status</span>
                <Badge
                  variant={getStatusBadgeVariant(visaDetail.country_id_status)}
                >
                  {visaDetail.country_id_status.charAt(0).toUpperCase() +
                    visaDetail.country_id_status.slice(1)}
                </Badge>
              </div>

              <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-medium">ID Expiry Date</span>
                <span className="text-sm">
                  {formatDate(visaDetail.country_id_expiry_date)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
