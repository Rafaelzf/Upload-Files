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
import { Button } from "@/components/ui/button";
import { MoreVertical, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

function FilecardActions({ file }: { file: Doc<"files"> }) {
  const deleteFile = useMutation(api.files.deleteFile);
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
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

export function Filecard({ file }: { file: Doc<"files"> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          {file.name}
          <FilecardActions file={file} />
        </CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card Content</p>
      </CardContent>
      <CardFooter>
        <Button>Dowload</Button>
      </CardFooter>
    </Card>
  );
}
