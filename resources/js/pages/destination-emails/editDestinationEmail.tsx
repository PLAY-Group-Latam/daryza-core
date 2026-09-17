import { DestinationEmailForm } from './components/DestinationEmailForm';
import { DestinationEmail, DestinationEmailPageOption } from './types';

export default function EditDestinationEmail({
    destinationEmail,
    pageOptions,
}: {
    destinationEmail: DestinationEmail;
    pageOptions: DestinationEmailPageOption[];
}) {
    return (
        <DestinationEmailForm
            mode="edit"
            destinationEmail={destinationEmail}
            pageOptions={pageOptions}
        />
    );
}
