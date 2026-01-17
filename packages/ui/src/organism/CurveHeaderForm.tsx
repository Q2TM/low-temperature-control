"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@repo/ui/atom/button";
import { Input } from "@repo/ui/atom/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/molecule/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/molecule/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/molecule/select";

const curveHeaderSchema = z.object({
  curveName: z.string().min(1, "Curve name is required"),
  serialNumber: z.string().min(1, "Serial number is required"),
  curveDataFormat: z.union([z.literal(2), z.literal(3), z.literal(4)]),
  temperatureLimit: z.number().positive("Temperature limit must be positive"),
  coefficient: z.union([z.literal(1), z.literal(2)]),
});

export type CurveHeaderFormValues = z.infer<typeof curveHeaderSchema>;

interface CurveHeaderFormProps {
  initialData?: CurveHeaderFormValues;
  onSubmit: (data: CurveHeaderFormValues) => Promise<void>;
  isLoading?: boolean;
}

const curveFormatOptions = [
  { value: 2, label: "Ohm/Kelvin" },
  { value: 3, label: "Log Ohm/Kelvin" },
  { value: 4, label: "Log Ohm/Log Kelvin" },
];

const coefficientOptions = [
  { value: 1, label: "Negative" },
  { value: 2, label: "Positive" },
];

export function CurveHeaderForm({
  initialData,
  onSubmit,
  isLoading = false,
}: CurveHeaderFormProps) {
  const form = useForm<CurveHeaderFormValues>({
    resolver: zodResolver(curveHeaderSchema),
    defaultValues: initialData || {
      curveName: "",
      serialNumber: "",
      curveDataFormat: 2,
      temperatureLimit: 0,
      coefficient: 1,
    },
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Curve Information</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name="curveName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Curve Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Curve name"
                        {...field}
                        className="h-9"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="serialNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Serial Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Serial #"
                        {...field}
                        className="h-9"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="curveDataFormat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Format</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Format" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {curveFormatOptions.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value.toString()}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="temperatureLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Temp Limit (K)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.001"
                        placeholder="Temp limit"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                        className="h-9"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="coefficient"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Coefficient</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Coefficient" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {coefficientOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value.toString()}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading} className="w-full h-9">
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
