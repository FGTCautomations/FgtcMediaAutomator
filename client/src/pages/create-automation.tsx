import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { insertAutomationSchema } from "@shared/schema";
import type { z } from "zod";

type AutomationFormData = z.infer<typeof insertAutomationSchema>;

const automationTypes = [
  { value: "welcome_series", label: "Welcome Series", description: "Automatically welcome new followers" },
  { value: "daily_quotes", label: "Daily Quotes", description: "Post inspirational content daily" },
  { value: "engagement_boost", label: "Engagement Boost", description: "Repost popular content" },
  { value: "hashtag_campaign", label: "Hashtag Campaign", description: "Auto-post with trending hashtags" },
  { value: "cross_platform", label: "Cross Platform", description: "Share content across platforms" },
];

export default function CreateAutomation() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AutomationFormData>({
    resolver: zodResolver(insertAutomationSchema.omit({ userId: true })),
    defaultValues: {
      name: "",
      description: "",
      type: "",
      config: {},
      isActive: true,
    },
  });

  const createAutomationMutation = useMutation({
    mutationFn: async (data: Omit<AutomationFormData, 'userId'>) => {
      const response = await apiRequest("POST", "/api/automations", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/automations"] });
      toast({
        title: "Success",
        description: "Automation created successfully",
      });
      setLocation("/automations");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create automation",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: Omit<AutomationFormData, 'userId'>) => {
    createAutomationMutation.mutate(data);
  };

  const selectedType = form.watch("type");
  const selectedTypeInfo = automationTypes.find(type => type.value === selectedType);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Automation</h1>
        <p className="text-gray-600 dark:text-gray-400">Set up automated workflows for your social media</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Automation Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Automation Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter automation name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Automation Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select automation type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {automationTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedTypeInfo && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {selectedTypeInfo.description}
                  </p>
                </div>
              )}

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe what this automation does"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Start Active
                      </FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Enable this automation immediately after creation
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/automations")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createAutomationMutation.isPending}
                >
                  {createAutomationMutation.isPending ? "Creating..." : "Create Automation"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}