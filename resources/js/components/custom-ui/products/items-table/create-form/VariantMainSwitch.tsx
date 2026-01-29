import { Switch } from '@/components/ui/switch';
import { useFormContext, useWatch } from 'react-hook-form';
import { ProductFormValues } from './FormProduct';

interface Props {
    index: number;
}

export function VariantMainSwitch({ index }: Props) {
    const { control, setValue } = useFormContext<ProductFormValues>();

    const variants = useWatch({
        control,
        name: 'variants',
        defaultValue: [],
    });

    const isMain = variants[index]?.is_main || false;

    const handleMainChange = (checked: boolean) => {
        if (checked) {
            // Solo esta variante será principal
            const updated = variants.map((v, i) => ({
                ...v,
                is_main: i === index,
            }));
            setValue('variants', updated);
        } else {
            // Si se desmarca, ninguna será principal
            const updated = [...variants];
            updated[index].is_main = false;
            setValue('variants', updated);
        }
    };

    return (
        <div className="mt-2 flex items-center gap-2 md:mt-0">
            <Switch checked={isMain} onCheckedChange={handleMainChange} />
            <span className="text-xs">Principal</span>
        </div>
    );
}
