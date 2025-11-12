import { useMutation } from '@apollo/client';
import ContactForm from '../components/contact/ContactForm';
import { CREATE_CONTACT_MESSAGE } from '../graphql/queries';
import { useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../context/SiteSettingsContext';

const ContactPage = () => {
  const { siteSettings } = useSiteSettings();
  const { user } = useAuth();
  const [createMessage, { loading }] = useMutation(CREATE_CONTACT_MESSAGE);

  const handleSubmit = async ({ email, message }: { email: string; message: string }) => {
    await createMessage({
      variables: {
        input: {
          userId: user?.id ?? email,
          message,
        },
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-4">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.5em] text-orange-500">Contact</p>
        <h1 className="text-4xl font-bold uppercase tracking-[0.4em]">Get In Touch</h1>
        <p className="text-gray-400">
          Reach us at {siteSettings.contactEmail || 'hello@djdip.com'} or use the form below.
        </p>
      </div>
      <ContactForm onSubmit={handleSubmit} submitting={loading} initialValues={{ email: user?.email || '' }} />
      <div className="rounded-3xl border border-white/10 bg-black/40 p-6 space-y-2 text-sm text-gray-400">
        <p>
          <strong>Email:</strong> {siteSettings.contactEmail || 'hello@djdip.com'}
        </p>
        <p>
          <strong>Phone:</strong> {siteSettings.contactPhone || 'N/A'}
        </p>
        <p>
          <strong>Address:</strong> {siteSettings.contactAddress || 'Worldwide'}
        </p>
      </div>
    </div>
  );
};

export default ContactPage;
