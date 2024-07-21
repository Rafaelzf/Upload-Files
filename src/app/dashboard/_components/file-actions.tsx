import { Doc } from "../../../../convex/_generated/dataModel";

import clsx from "clsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileIcon,
  MoreVertical,
  StarHalf,
  StarIcon,
  Trash2Icon,
  Undo2Icon,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { useToast } from "@/components/ui/use-toast";
import { Protect, useOrganization } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { getFileUrl } from "@/lib/utils";

export function FilecardActions({
  file,
  isFavorited,
}: {
  file: Doc<"files">;
  isFavorited: boolean;
}) {
  const restoreFile = useMutation(api.files.restoreFile);
  const deleteFile = useMutation(api.files.deleteFile);
  const favoriteFile = useMutation(api.files.toggleFavorite);
  const me = useQuery(api.users.getMe);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const { organization } = useOrganization();
  const { toast } = useToast();

  const isPersonalAccount = !organization;

  const className = clsx({
    "text-red-600": !file.shouldDelete,
    "text-green-600": file.shouldDelete,
  });

  return (
    <>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await deleteFile({ fileId: file._id });
                setConfirmOpen(false);

                toast({
                  variant: "success",
                  title: "File deleted",
                  description: "Your file has been permanently deleted",
                });
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <MoreVertical />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <Protect
            condition={(check) => {
              return (
                check({
                  role: "org:admin",
                }) || file.userId === me?._id
              );
            }}
            fallback={<></>}
          >
            <DropdownMenuItem
              className={`flex gap-1 items-center cursor-pointer ${className}`}
              onClick={() => {
                if (file.shouldDelete) {
                  return restoreFile({
                    fileId: file._id,
                  });
                }
                return setConfirmOpen(true);
              }}
            >
              {file.shouldDelete ? (
                <>
                  <Undo2Icon className="h-4 w-4" /> Restore
                </>
              ) : (
                <>
                  <Trash2Icon className="h-4 w-4" /> Delete
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </Protect>

          <DropdownMenuItem
            className="flex gap-1 items-center cursor-pointer"
            onClick={() => favoriteFile({ fileId: file._id })}
          >
            {isFavorited ? (
              <StarHalf className="h-4 w-4" />
            ) : (
              <StarIcon className="h-4 w-4" />
            )}
            Favorite
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              if (!file.filedId) return;
              window.open(getFileUrl(file.filedId), "_blank");
            }}
            className="flex gap-1 items-center cursor-pointer"
          >
            <FileIcon className="w-4 h-4" /> Download
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
