import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

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
import { Doc } from "../../../../convex/_generated/dataModel";
import { formatRelative } from "date-fns";
import {
  FileIcon,
  FileTextIcon,
  GanttChartIcon,
  ImageIcon,
  MoreVertical,
  StarHalf,
  StarIcon,
  Trash2Icon,
  Undo2Icon,
} from "lucide-react";
import { ReactNode, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Protect, useOrganization } from "@clerk/nextjs";
import clsx from "clsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
function FilecardActions({
  file,
  isFavorited,
}: {
  file: Doc<"files">;
  isFavorited: boolean;
}) {
  const restoreFile = useMutation(api.files.restoreFile);
  const deleteFile = useMutation(api.files.deleteFile);
  const favoriteFile = useMutation(api.files.toggleFavorite);

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
          <Protect role="org:admin" fallback={<></>}>
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

          {isPersonalAccount && (
            <>
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
            </>
          )}

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

function getFileUrl(fileId: string) {
  const baseURL = process.env.NEXT_PUBLIC_CONVEX_URL;
  const siteURL = baseURL?.replace(".cloud", ".site");
  const getImageUrl = new URL(`${siteURL}/getImage`);
  getImageUrl.searchParams.set("storageId", fileId);
  return getImageUrl.href;
}

export function Filecard({
  file,
  favorites,
}: {
  file: Doc<"files">;
  favorites: Doc<"favorites">[];
}) {
  const typeIcons = {
    image: <ImageIcon />,
    pdf: <FileTextIcon />,
    csv: <GanttChartIcon />,
  } as Record<Doc<"files">["type"], ReactNode>;

  const userProfile = useQuery(api.users.getUserProfile, {
    userId: file.userId,
  });

  const isFavorited = favorites.some(
    (favorite) => favorite.fileId === file._id
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center text-base font-normal">
          {file.name}
          <FilecardActions file={file} isFavorited={isFavorited} />
        </CardTitle>
        <CardDescription className="flex gap-2 items-center">
          {typeIcons[file.type]} {file.type}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <></>
        {file.type === "pdf" ? (
          <Image src="/pdf.jpg" alt={file.name} width={300} height={300} />
        ) : (
          <Image
            src={getFileUrl(file.filedId)}
            alt={file.name}
            width={300}
            height={300}
          />
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-2 text-xs text-gray-700 w-40 items-center">
          <Avatar className="w-6 h-6">
            <AvatarImage src={userProfile?.image} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          {userProfile?.name}
        </div>
        <div className="text-xs text-gray-700">
          Uploaded on {formatRelative(new Date(file._creationTime), new Date())}
        </div>
      </CardFooter>
    </Card>
  );
}
