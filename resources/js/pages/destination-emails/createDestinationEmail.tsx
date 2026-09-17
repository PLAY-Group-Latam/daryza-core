import { DestinationEmailForm } from './components/DestinationEmailForm';
import { DestinationEmailPageOption } from './types';

export default function CreateDestinationEmail({
    pageOptions,
}: {
    pageOptions: DestinationEmailPageOption[];
}) {
    return <DestinationEmailForm mode="create" pageOptions={pageOptions} />;
}
