import { Link } from 'react-router-dom';
import { Button, Card, Skeleton } from '@/components/ui';
import { useActiveServices, useActiveDoctors, useActiveTestimonials, useLatestArticles, useWebsiteContent } from '../../website.hooks';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Star, ArrowRight, Heart, Stethoscope, Scissors, Syringe } from 'lucide-react';

export default function HomePage() {
  const { data: contentData = [] } = useWebsiteContent();
  const servicesQuery = useActiveServices();
  const doctorsQuery = useActiveDoctors();
  const testimonialsQuery = useActiveTestimonials();
  const articlesQuery = useLatestArticles();

  useDocumentTitle('Home');

  const heroContent = contentData.find((d: any) => d.section_key === 'hero');
  const heroTitle = heroContent?.content?.title || 'Welcome to PetCare Suite';
  const heroSubtitle = heroContent?.content?.subtitle || 'Compassionate care for your beloved pets.';

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 py-24 px-4 text-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl animate-float" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-400/10 blur-3xl animate-float-delayed" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {heroTitle}
          </h1>
          <p className="mt-6 text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
            {heroSubtitle}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-blue-700 hover:bg-blue-50 shadow-lg">
              <Link to="/booking">Book Appointment</Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="border-white/20 text-white hover:bg-white/10">
              <Link to="/services">Our Services</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      {servicesQuery.data && servicesQuery.data.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-20 animate-slide-up">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Our Services</h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400">Comprehensive care for your beloved companions</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {servicesQuery.isLoading
              ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)
              : servicesQuery.data.map((svc: any) => (
                  <Card key={svc.id} className="p-6 transition-all duration-200 hover:shadow-card-hover hover:-translate-y-1">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 mb-4">
                      <Stethoscope className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{svc.name}</h3>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{svc.description}</p>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">{formatCurrency(svc.price)}</span>
                      <span className="text-slate-400 dark:text-slate-500">{svc.duration_minutes} min</span>
                    </div>
                  </Card>
                ))}
          </div>
        </section>
      )}

      {/* Doctors Section */}
      {doctorsQuery.data && doctorsQuery.data.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-20 bg-slate-50/50 dark:bg-slate-900/50 animate-slide-up">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Meet Our Doctors</h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400">Dedicated professionals who care for your pets</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {doctorsQuery.isLoading
              ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)
              : doctorsQuery.data.map((doc: any) => (
                  <Card key={doc.id} className="p-6 text-center transition-all duration-200 hover:shadow-card-hover hover:-translate-y-1">
                    {doc.photo_url ? (
                      <img src={doc.photo_url} alt={doc.full_name} className="mx-auto h-24 w-24 rounded-full object-cover ring-4 ring-blue-100 dark:ring-blue-900/30" />
                    ) : (
                      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-2xl font-bold text-white shadow-sm">
                        {doc.full_name?.charAt(0)?.toUpperCase() || 'D'}
                      </div>
                    )}
                    <h3 className="mt-4 font-semibold text-slate-900 dark:text-slate-100">{doc.full_name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{doc.specialization}</p>
                  </Card>
                ))}
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      {testimonialsQuery.data && testimonialsQuery.data.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-20 animate-slide-up">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">What Our Clients Say</h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400">Trusted by pet owners across the community</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonialsQuery.isLoading
              ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)
              : testimonialsQuery.data.map((t: any) => (
                  <Card key={t.id} className="p-6 transition-all duration-200 hover:shadow-card-hover">
                    <div className="flex gap-1 mb-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < t.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'}`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">&ldquo;{t.content}&rdquo;</p>
                    <p className="mt-4 text-sm font-semibold text-slate-900 dark:text-slate-100">&mdash; {t.customer_name}</p>
                  </Card>
                ))}
          </div>
        </section>
      )}

      {/* Articles Section */}
      {articlesQuery.data && articlesQuery.data.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-20 bg-slate-50/50 dark:bg-slate-900/50 animate-slide-up">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Latest Articles</h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400">Tips and insights for better pet care</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {articlesQuery.isLoading
              ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-2xl" />)
              : articlesQuery.data.map((a: any) => (
                  <Card key={a.id} className="overflow-hidden transition-all duration-200 hover:shadow-card-hover hover:-translate-y-1">
                    {a.cover_url ? (
                      <img src={a.cover_url} alt={a.title} className="h-48 w-full object-cover" />
                    ) : (
                      <div className="h-48 w-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-400 dark:from-blue-900/30 dark:to-slate-800">
                        <Heart className="h-12 w-12" />
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">{a.title}</h3>
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-3">
                        {a.excerpt?.length > 100 ? `${a.excerpt.slice(0, 100)}...` : a.excerpt}
                      </p>
                      <Link to={`/articles/${a.slug}`} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                        Read More <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </Card>
                ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 animate-slide-up">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 to-slate-900 p-12 text-center">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-blue-400/10 blur-3xl" />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white">Ready to Visit Us?</h2>
            <p className="mt-3 text-blue-100">Schedule an appointment for your pet today.</p>
            <Button asChild size="lg" className="mt-8 bg-white text-blue-700 hover:bg-blue-50 shadow-lg">
              <Link to="/booking">Book Appointment</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}