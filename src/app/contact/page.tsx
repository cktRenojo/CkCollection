import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-bold font-headline mb-4">Contact Us</h1>
        <p className="text-lg text-muted-foreground">
          We'd love to hear from you. Whether you have a question about our products, pricing, or anything else, our team is ready to answer all your questions.
        </p>
      </div>

      <div className="mt-12 grid md:grid-cols-3 gap-8">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="mt-4">Email Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Our support team will get back to you within 24 hours.
            </p>
            <a href="mailto:support@ckapparel.com" className="font-semibold text-primary mt-2 inline-block hover:underline">
              support@ckapparel.com
            </a>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardHeader>
             <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
              <Phone className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="mt-4">Call Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Mon-Fri from 8am to 5pm.
            </p>
            <a href="tel:+1234567890" className="font-semibold text-primary mt-2 inline-block hover:underline">
              +1 (234) 567-890
            </a>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
             <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
              <MapPin className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="mt-4">Visit Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              123 Fashion Ave, New York, NY 10001
            </p>
            <a href="#" className="font-semibold text-primary mt-2 inline-block hover:underline">
              Get Directions
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
