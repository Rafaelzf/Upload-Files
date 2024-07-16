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
import { Doc, Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  FileTextIcon,
  GanttChartIcon,
  ImageIcon,
  MoreVertical,
  StarHalf,
  StarIcon,
  Trash2Icon,
} from "lucide-react";
import { ReactNode, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

function FilecardActions({
  file,
  isFavorited,
}: {
  file: Doc<"files">;
  isFavorited: boolean;
}) {
  const deleteFile = useMutation(api.files.deleteFile);
  const favoriteFile = useMutation(api.files.toggleFavorite);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const { toast } = useToast();
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
          <DropdownMenuItem
            className="flex gap-1 text-red-600 items-center cursor-pointer"
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2Icon className="h-4 w-4" /> Delete
          </DropdownMenuItem>
          <DropdownMenuSeparator />
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
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

//https://doting-bulldog-420.convex.cloud/api/storage/aab7fde0-0677-4b0d-ba9f-f702a999feec
//https://doting-bulldog-420.convex.cloud/getImage?storageId=aab7fde0-0677-4b0d-ba9f-f702a999feec

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

  const isFavorited = favorites.some(
    (favorite) => favorite.fileId === file._id
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
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
      <CardFooter>
        <Button
          onClick={() => {
            window.open(getFileUrl(file.filedId), "_blank");
          }}
        >
          Dowload
        </Button>
      </CardFooter>
    </Card>
  );
}
