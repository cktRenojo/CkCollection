import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import type { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`} className="group">
      <Card className="h-full overflow-hidden transition-all duration-300 group-hover:shadow-xl border-transparent hover:border-border">
        <CardContent className="p-0">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-t-lg">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={product.dataAiHint}
            />
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start p-4 bg-card">
          <h3 className="font-semibold text-lg">{product.name}</h3>
          <p className="text-muted-foreground text-sm">{product.category}</p>
          <p className="mt-2 font-medium text-lg text-primary">₱{product.price.toFixed(2)}</p>
        </CardFooter>
      </Card>
    </Link>
  );
}
