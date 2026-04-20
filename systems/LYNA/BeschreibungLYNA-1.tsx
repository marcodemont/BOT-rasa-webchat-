import { motion } from 'motion/react';
import { Brain, Sparkles, Activity, Zap, Shield, TrendingUp, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';
import { Card } from '../../components/ui/card';

const colors = {
  primary: '#1C77C3',
  turquoise: '#0DB3A9',
  orange: '#FF7A21',
  gold: '#FFC000',
  midGray: '#9EA5AE',
  darkGray: '#444B54'
};

interface BeschreibungLYNAProps {
  onBack: () => void;
}

export function BeschreibungLYNA({ onBack }: BeschreibungLYNAProps) {
  const capabilities = [
    {
      icon: Activity,
      title: 'Echtzeit-Analyse',
      description: 'LYNA analysiert Ihre Vitalparameter kontinuierlich und erkennt Muster in Echtzeit.',
      color: colors.primary
    },
    {
      icon: AlertTriangle,
      title: 'Früherkennung',
      description: 'Automatische Detektion von Anomalien, bevor sie kritisch werden - mit 99.2% Genauigkeit.',
      color: colors.orange
    },
    {
      icon: TrendingUp,
      title: 'Trend-Prognosen',
      description: 'Vorhersage von Gesundheitstrends basierend auf historischen Daten und KI-Modellen.',
      color: colors.turquoise
    },
    {
      icon: Brain,
      title: 'Personalisierte Insights',
      description: 'Individuelle Gesundheitsempfehlungen basierend auf Ihrem einzigartigen Profil.',
      color: colors.gold
    }
  ];

  const features = [
    {
      category: 'Vitalparameter-Interpretation',
      items: [
        'Herzfrequenz-Variabilität (HRV) Analyse',
        'SpO₂-Trend-Bewertung mit Kontext',
        'Atemfrequenz-Muster-Erkennung',
        'Blutdruck-Korrelations-Analyse',
        'Temperatur-Anomalie-Detektion'
      ],
      color: colors.primary
    },
    {
      category: 'KI-gestützte Diagnostik',
      items: [
        'Arrhythmie-Klassifikation (15+ Typen)',
        'Schlafqualitäts-Scoring',
        'Belastungs- und Erholungs-Balance',
        'Stress-Level-Bewertung',
        'Infektions-Frühwarnung'
      ],
      color: colors.turquoise
    },
    {
      category: 'Interaktive Unterstützung',
      items: [
        'Natürlichsprachige Erklärungen',
        'Kontextualisierte Wert-Interpretation',
        'Personalisierte Handlungsempfehlungen',
        'Vergleich mit Normwerten',
        '24/7 verfügbarer Chat-Support'
      ],
      color: colors.gold
    }
  ];

  const technicalSpecs = [
    { label: 'KI-Modell', value: 'Transformer-basiert, 150M Parameter' },
    { label: 'Trainings-Daten', value: '50+ Millionen Vitalparameter-Messungen' },
    { label: 'Genauigkeit', value: '99.2% validiert in klinischen Studien' },
    { label: 'Reaktionszeit', value: '< 100ms für Echtzeit-Analysen' },
    { label: 'Sprachen', value: 'Deutsch, Englisch, weitere auf Anfrage' },
    { label: 'Compliance', value: 'DSGVO, HIPAA, FDA Class II' }
  ];

  return (
    <section id="lyna" className="min-h-screen py-20 px-4 bg-gradient-to-b from-background via-secondary/10 to-background">
      <div className="max-w-7xl mx-auto">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-3 mb-6 px-8 py-4 rounded-full" style={{ background: `linear-gradient(135deg, ${colors.gold}20, ${colors.gold}40)` }}>
            <Brain className="size-8" style={{ color: colors.gold }} />
            <span className="text-2xl" style={{ color: colors.gold }}>LYNA AI</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl mb-6">
            <span style={{ color: colors.gold }}>L</span>ayered{' '}
            <span style={{ color: colors.gold }}>Y</span>ield{' '}
            <span style={{ color: colors.gold }}>N</span>on-invasive{' '}
            <span style={{ color: colors.gold }}>A</span>nalytics
          </h1>
          
          <p className="text-2xl md:text-3xl mb-8" style={{ color: colors.midGray }}>
            Ihre persönliche KI-Assistentin für Gesundheitsdaten
          </p>
          
          <p className="text-xl max-w-4xl mx-auto leading-relaxed" style={{ color: colors.darkGray }}>
            LYNA ist die intelligente Schnittstelle zwischen komplexen medizinischen Daten und verständlichen 
            Gesundheitsinformationen. Mit modernster KI-Technologie hilft LYNA Ihnen, Ihre Vitalwerte richtig 
            zu interpretieren und fundierte Entscheidungen zu treffen.
          </p>
        </motion.div>

        {/* Main Capabilities */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {capabilities.map((capability, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 h-full border-2 hover:shadow-xl transition-all text-center group" style={{ borderColor: `${capability.color}30` }}>
                <div className="size-16 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: `${capability.color}15` }}>
                  <capability.icon className="size-8" style={{ color: capability.color }} />
                </div>
                <h3 className="text-xl mb-3">{capability.title}</h3>
                <p className="text-sm" style={{ color: colors.darkGray }}>{capability.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* How LYNA Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-4xl mb-12 text-center">Wie LYNA funktioniert</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Datenerfassung',
                description: 'FRAKTAL VitalSystem misst kontinuierlich Ihre Vitalparameter mit höchster Präzision.',
                icon: Activity,
                color: colors.primary
              },
              {
                step: '02',
                title: 'KI-Analyse',
                description: 'LYNA nutzt das patentierte Fractal Neural Network (FNN) mit mehrschichtiger Architektur für Echtzeit-Mustererkennung und Korrelationsanalyse Ihrer Vitaldaten.',
                icon: Brain,
                color: colors.gold
              },
              {
                step: '03',
                title: 'Interaktive Erklärung',
                description: 'Sie erhalten verständliche Erklärungen und können LYNA jederzeit Fragen stellen.',
                icon: Sparkles,
                color: colors.turquoise
              }
            ].map((item, index) => (
              <Card key={index} className="p-8 border-2 relative overflow-hidden group hover:shadow-2xl transition-all" style={{ borderColor: `${item.color}30` }}>
                <div className="absolute top-0 right-0 text-8xl opacity-5 font-bold" style={{ color: item.color }}>
                  {item.step}
                </div>
                <div className="size-14 rounded-full mb-4 flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: `${item.color}15` }}>
                  <item.icon className="size-7" style={{ color: item.color }} />
                </div>
                <h3 className="text-2xl mb-3">{item.title}</h3>
                <p style={{ color: colors.darkGray }}>{item.description}</p>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Feature Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-4xl mb-12 text-center">LYNA's Fähigkeiten</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 border-2" style={{ borderColor: `${feature.color}30` }}>
                <h3 className="text-xl mb-4 pb-3 border-b-2" style={{ color: feature.color, borderColor: feature.color }}>
                  {feature.category}
                </h3>
                <ul className="space-y-3">
                  {feature.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="size-5 mt-0.5 flex-shrink-0" style={{ color: feature.color }} />
                      <span className="text-sm" style={{ color: colors.darkGray }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Technical Specifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <Card className="p-8 border-2" style={{ borderColor: `${colors.gold}40`, background: `linear-gradient(135deg, ${colors.gold}05, transparent)` }}>
            <div className="flex items-center gap-4 mb-8">
              <Zap className="size-10" style={{ color: colors.gold }} />
              <h2 className="text-3xl">Technische Spezifikationen</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {technicalSpecs.map((spec, index) => (
                <div key={index} className="flex items-start gap-4 p-4 rounded-lg" style={{ backgroundColor: `${colors.gold}10` }}>
                  <Shield className="size-5 mt-1 flex-shrink-0" style={{ color: colors.gold }} />
                  <div>
                    <div className="font-medium mb-1" style={{ color: colors.darkGray }}>{spec.label}</div>
                    <div className="text-sm" style={{ color: colors.midGray }}>{spec.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* CTA to Chat */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Card className="inline-block p-10 border-4" style={{ borderColor: colors.gold, background: `linear-gradient(135deg, ${colors.gold}10, ${colors.gold}20)` }}>
            <Brain className="size-20 mx-auto mb-6" style={{ color: colors.gold }} />
            <h2 className="text-3xl mb-4">Probieren Sie LYNA jetzt aus!</h2>
            <p className="text-xl mb-8 max-w-2xl" style={{ color: colors.darkGray }}>
              Klicken Sie auf das Chat-Symbol unten rechts und stellen Sie LYNA Ihre Fragen 
              zu Vitalwerten, Gesundheitstrends und medizinischen Daten.
            </p>
            <div className="inline-flex items-center gap-3 px-8 py-4 rounded-full animate-pulse" style={{ backgroundColor: colors.gold }}>
              <Sparkles className="size-6 text-black" />
              <span className="text-xl text-black font-semibold">24/7 Verfügbar</span>
            </div>
          </Card>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <button
            onClick={onBack}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-lg border-2 hover:shadow-xl transition-all"
            style={{ borderColor: colors.primary, backgroundColor: `${colors.primary}10` }}
          >
            <ArrowLeft className="size-6" style={{ color: colors.primary }} />
            <span className="text-xl" style={{ color: colors.primary }}>Zurück zur Startseite</span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
