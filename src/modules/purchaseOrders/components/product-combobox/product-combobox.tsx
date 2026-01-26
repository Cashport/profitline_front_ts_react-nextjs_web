import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/utils/utils";
import { Button } from "@/modules/chat/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/modules/chat/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/modules/chat/ui/popover";
import { IProduct } from "@/types/commerce/ICommerce";

interface ProductComboboxProps {
  products: IProduct[];
  value?: number | null;
  onValueChange: (value: number) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function ProductCombobox({
  products,
  value,
  onValueChange,
  placeholder = "Seleccionar producto",
  disabled = false,
  className
}: ProductComboboxProps) {
  const [open, setOpen] = useState(false);

  const selectedProduct = products.find((product) => product.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full h-8 justify-between text-left font-normal", className)}
          disabled={disabled}
          type="button"
        >
          <span className="truncate">
            {selectedProduct ? selectedProduct.description : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar producto..." />
          <CommandList>
            <CommandEmpty>No se encontró el producto.</CommandEmpty>
            <CommandGroup>
              {products.map((product) => (
                <CommandItem
                  key={product.id}
                  value={`${product.description} ${product.SKU || ""}`}
                  onSelect={() => {
                    onValueChange(product.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === product.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-sm truncate">{product.description}</span>
                    {product.SKU && (
                      <span className="text-xs text-muted-foreground">SKU: {product.SKU}</span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
