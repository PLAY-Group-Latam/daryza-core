import { Switch } from '@/components/ui/switch';
import { useFormContext, useWatch } from 'react-hook-form';
import { ProductFormValues } from './FormProduct';

interface Props {
    index: number;
}

export function VariantMainSwitch({ index }: Props) {
    const { control, setValue, getValues } =
        useFormContext<ProductFormValues>();

    const isMain = useWatch({
        control,
        name: `variants.${index}.is_main`,
    });

    const handleMainChange = (checked: boolean) => {
        if (!checked) return;
        const variants = getValues('variants'); // 👈 estado real, no "fields"

        if (checked) {
            variants.forEach((_, i) => {
                setValue(`variants.${i}.is_main`, i === index, {
                    shouldDirty: true,
                    shouldTouch: false,
                    shouldValidate: false,
                });
            });
        } else {
            setValue(`variants.${index}.is_main`, false, {
                shouldDirty: true,
                shouldTouch: false,
                shouldValidate: false,
            });
        }
    };

    return (
        <div className="mt-2 flex items-center gap-2 md:mt-0">
            <Switch checked={!!isMain} onCheckedChange={handleMainChange} />
            <span className="text-xs">Principal</span>
        </div>
    );
}
