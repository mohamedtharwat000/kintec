import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { tryCatch } from "@/lib/utils";

interface DeleteConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onDelete: (id: string) => Promise<any>;
  itemId: string | null;
  title?: string;
  description?: string;
  successMessage?: string;
  errorMessage?: string;
  cancelText?: string;
  confirmText?: string;
}

export function DeleteConfirmationDialog({
  open,
  onClose,
  onDelete,
  itemId,
  title = "Are you absolutely sure?",
  description = "This action cannot be undone. This will permanently delete this item and remove all related data.",
  successMessage = "Item deleted successfully",
  errorMessage = "Failed to delete item",
  cancelText = "Cancel",
  confirmText = "Delete",
}: DeleteConfirmationDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!itemId || isDeleting) return;

    setIsDeleting(true);
    const { error } = await tryCatch(() => onDelete(itemId));

    if (error) {
      toast.error(`${errorMessage}: ${error.message}`);
      setIsDeleting(false);
    } else {
      toast.success(successMessage);
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(open) => {
        if (!isDeleting && !open) {
          onClose();
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <AlertDialogCancel className="mt-2 sm:mt-0" disabled={isDeleting}>
            {cancelText}
          </AlertDialogCancel>
          <Button
            onClick={handleConfirmDelete}
            className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
