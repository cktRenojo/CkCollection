import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import type { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`}>
      <Card className="h-full overflow-hidden transition-shadow duration-300 hover:shadow-xl">
        <CardContent className="p-0">
          <div className="relative aspect-[3/4] w-full">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
              data-ai-hint={product.dataAiHint}
            />
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start p-4">
          <h3 className="font-semibold text-lg">{product.name}</h3>
          <p className="text-muted-foreground text-sm">{product.category}</p>
          <p className="mt-2 font-medium text-lg">${product.price.toFixed(2)}</p>
        </CardFooter>
      </Card>
    </Link>
  );
}
