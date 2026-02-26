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
    <div className="min-h-screen text-white">
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-6">
        <div className="space-y-2">
          <p className="text-eyebrow text-orange-400">Contact</p>
          <h1 className="text-4xl lg:text-5xl font-bold">Get In Touch</h1>
          <p className="text-gray-400">
            Reach us at {siteSettings.contactEmail || 'hello@djdip.com'} or use the form below.
          </p>
        </div>
        <ContactForm onSubmit={handleSubmit} submitting={loading} initialValues={{ email: user?.email || '' }} />
        <div className="liquid-glass rounded-3xl border border-white/[0.10] bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl p-6 space-y-2 text-sm text-gray-400">
          <p>
            <strong className="text-white">Email:</strong> {siteSettings.contactEmail || 'hello@djdip.com'}
          </p>
          <p>
            <strong className="text-white">Phone:</strong> {siteSettings.contactPhone || 'N/A'}
          </p>
          <p>
            <strong className="text-white">Address:</strong> {siteSettings.contactAddress || 'Worldwide'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
