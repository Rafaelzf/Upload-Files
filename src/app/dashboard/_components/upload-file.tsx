"use client";

import { useMutation } from "convex/react";
import { useOrganization, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { api } from "../../../../convex/_generated/api";

const formSchema = z.object({
  title: z.string().min(1).max(200),
  file: z
    .custom<FileList>((val) => val instanceof FileList, "Required")
    .refine((files) => files.length > 0, `Required`),
});

export default function UploadFile() {
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
  const organization = useOrganization();
  const user = useUser();
  const { toast } = useToast();
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  let orgId: any = null;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      file: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!orgId) return;
    const formData = new FormData();
    formData.append("title", values.title);
    if (values.file && values.file[0]) {
      formData.append("file", values.file[0]);
    }

    // Step 1: Get a short-lived upload URL
    const postUrl = await generateUploadUrl();
    // Step 2: POST the file to the URL
    const result = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": values.file[0]!.type },
      body: values.file[0],
    });
    const { storageId } = await result.json();
    // Step 3: Save the newly allocated storage id to the database

    try {
      await createFile({
        name: values.title,
        filedId: storageId,
        orgId,
      });

      form.reset();
      setIsFileDialogOpen(false);

      toast({
        variant: "success",
        title: "File Uploaded",
        description: "Now everyone can view your file",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Your file could not be uploaded, try again later",
      });
      console.error("Detalhes do erro:", error);
    }
  }

  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }

  const createFile = useMutation(api.files.createFiles);

  return (
    <Dialog
      open={isFileDialogOpen}
      onOpenChange={(isOpen) => {
        setIsFileDialogOpen(isOpen);
        form.reset();
      }}
    >
      <DialogTrigger asChild>
        <Button onClick={() => {}}>Upload File</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="mb-10">Upload your file here.</DialogTitle>
          <DialogDescription className="pb-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="shadcn" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="file"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your File</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          onChange={(event) => {
                            if (!event.target.files) return;
                            field.onChange(event.target.files);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  )}
                  Submit
                </Button>
              </form>
            </Form>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
