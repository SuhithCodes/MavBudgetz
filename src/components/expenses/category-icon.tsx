import type { LucideProps } from 'lucide-react';
import {
  Car,
  HeartPulse,
  Lightbulb,
  Plane,
  ShoppingBag,
  ShoppingCart,
  Tag,
  Ticket,
  UtensilsCrossed,
} from 'lucide-react';
import type { FC } from 'react';

interface CategoryIconProps extends LucideProps {
  category: string;
}

export const CategoryIcon: FC<CategoryIconProps> = ({
  category,
  ...props
}) => {
  const normalizedCategory = category.toLowerCase().trim();

  switch (normalizedCategory) {
    case 'food & drink':
      return <UtensilsCrossed {...props} />;
    case 'groceries':
      return <ShoppingCart {...props} />;
    case 'shopping':
      return <ShoppingBag {...props} />;
    case 'transportation':
      return <Car {...props} />;
    case 'travel':
      return <Plane {...props} />;
    case 'utilities':
      return <Lightbulb {...props} />;
    case 'health':
      return <HeartPulse {...props} />;
    case 'entertainment':
      return <Ticket {...props} />;
    default:
      return <Tag {...props} />;
  }
};
