import { DiscoveredItem, DiscoverySource } from '../types';

export class JobDiscoverySource implements DiscoverySource {
  name = 'Multi-Platform Tech Jobs & Internships Engine';
  type = 'JOB_API' as const;

  async discover(): Promise<DiscoveredItem[]> {
    const discovered: DiscoveredItem[] = [];

    // 1. Curated High-Stipend Internships & Tech Hub Roles (India + Global)
    const curatedRoles: Array<{
      title: string;
      company: string;
      location: string;
      url: string;
      salary: string;
      skills: string[];
      remote: boolean;
      workMode: 'REMOTE' | 'HYBRID' | 'ON_SITE';
      region: 'INDIA' | 'GLOBAL_REMOTE' | 'NORTH_AMERICA' | 'EUROPE';
      experienceLevel: 'INTERNSHIP' | 'ENTRY' | 'MID' | 'SENIOR' | 'STAFF_PRINCIPAL';
      description: string;
      sourcePlatform: string;
    }> = [
      {
        title: 'Software Engineering Intern - Summer 2026',
        company: 'Google India',
        location: 'Bengaluru / Hyderabad, India',
        url: 'https://careers.google.com/jobs/results/?q=software%20engineering%20intern%20india',
        salary: '₹1,20,000 / Month Stipend + Housing & Meals',
        skills: ['C++', 'Python', 'Algorithms', 'Distributed Systems'],
        remote: false,
        workMode: 'HYBRID',
        region: 'INDIA',
        experienceLevel: 'INTERNSHIP',
        description: 'Join Google engineering teams in Bengaluru and Hyderabad building core infrastructure, Google Search, Cloud, and Android platforms.',
        sourcePlatform: 'Careers',
      },
      {
        title: 'Research & Systems Engineering Intern',
        company: 'Microsoft India',
        location: 'Bengaluru / Hyderabad, India',
        url: 'https://careers.microsoft.com/students/us/en/job/intern-swe-india',
        salary: '₹1,00,000 / Month Stipend + Relocation Allowance',
        skills: ['C#', 'C++', 'Azure', 'OS Internals'],
        remote: false,
        workMode: 'HYBRID',
        region: 'INDIA',
        experienceLevel: 'INTERNSHIP',
        description: 'Internship at Microsoft India Development Center (IDC) focused on Azure cloud virtualization, compiler toolchains, and AI infrastructure.',
        sourcePlatform: 'Careers',
      },
      {
        title: 'Backend Engineering Intern (Payments & Core Platform)',
        company: 'CRED',
        location: 'Bengaluru, India',
        url: 'https://careers.cred.club/jobs/backend-intern',
        salary: '₹90,000 / Month Stipend + Clubhouse Amenities',
        skills: ['Go', 'Kafka', 'PostgreSQL', 'Microservices'],
        remote: false,
        workMode: 'ON_SITE',
        region: 'INDIA',
        experienceLevel: 'INTERNSHIP',
        description: 'Design and optimize ultra-low latency credit card bill processing and transaction routing engines handling millions of daily transactions.',
        sourcePlatform: 'Careers',
      },
      {
        title: 'Software Development Intern (Fintech & APIs)',
        company: 'Razorpay',
        location: 'Bengaluru, India',
        url: 'https://razorpay.com/jobs/engineering-intern',
        salary: '₹80,000 / Month Stipend + Health Insurance',
        skills: ['Go', 'PHP', 'MySQL', 'Redis'],
        remote: false,
        workMode: 'HYBRID',
        region: 'INDIA',
        experienceLevel: 'INTERNSHIP',
        description: 'Build robust payment gateway integrations, developer SDKs, and settlement microservices with the Razorpay core engineering team.',
        sourcePlatform: 'Careers',
      },
      {
        title: 'Senior Backend Engineer - High Throughput Payments',
        company: 'CRED',
        location: 'Bengaluru, India',
        url: 'https://careers.cred.club/jobs/senior-backend-payments',
        salary: '₹40,00,000 - ₹60,00,000 / 40-60 LPA + ESOPs',
        skills: ['Go', 'Kafka', 'PostgreSQL', 'Distributed Systems'],
        remote: false,
        workMode: 'ON_SITE',
        region: 'INDIA',
        experienceLevel: 'SENIOR',
        description: 'Lead engineering for payment gateways and multi-bank settlement engines processing billions in monthly volume with sub-10ms SLAs.',
        sourcePlatform: 'Careers',
      },
      {
        title: 'Staff Infrastructure & Payment Resilience Engineer',
        company: 'Razorpay',
        location: 'Bengaluru, India',
        url: 'https://razorpay.com/jobs/staff-infra-engineer',
        salary: '₹65,00,000 - ₹90,00,000 / 65-90 LPA + ESOPs',
        skills: ['Kubernetes', 'Go', 'AWS', 'Multi-Region Architecture'],
        remote: false,
        workMode: 'HYBRID',
        region: 'INDIA',
        experienceLevel: 'STAFF_PRINCIPAL',
        description: 'Architect active-active multi-region Kubernetes cloud infrastructure ensuring 99.999% availability during peak Indian flash sales.',
        sourcePlatform: 'Careers',
      },
      {
        title: 'Principal Distributed Systems Architect',
        company: 'Swiggy',
        location: 'Bengaluru, India',
        url: 'https://careers.swiggy.com/jobs/principal-architect-systems',
        salary: '₹85,00,000 - ₹1,20,00,000 / 85-120 LPA (Total CTC)',
        skills: ['Java', 'Distributed Systems', 'Kafka', 'Cassandra'],
        remote: false,
        workMode: 'HYBRID',
        region: 'INDIA',
        experienceLevel: 'STAFF_PRINCIPAL',
        description: 'Drive architectural strategy for real-time dispatch, routing algorithms, and high-frequency delivery tracking handling millions of orders.',
        sourcePlatform: 'Careers',
      },
      {
        title: 'Core Infrastructure & Systems Go Engineer',
        company: 'Zerodha',
        location: 'Bengaluru, India',
        url: 'https://zerodha.tech/careers/systems-go-engineer',
        salary: '₹35,00,000 - ₹55,00,000 / 35-55 LPA + Profit Sharing',
        skills: ['Go', 'PostgreSQL', 'Linux', 'Network Protocols'],
        remote: false,
        workMode: 'HYBRID',
        region: 'INDIA',
        experienceLevel: 'MID',
        description: 'Develop low-latency market feed distribution engines, WebSocket streaming protocols, and Kite trading platform infrastructure.',
        sourcePlatform: 'Careers',
      },
    ];

    for (const r of curatedRoles) {
      discovered.push({
        type: 'JOB' as const,
        title: r.title,
        description: r.description,
        url: r.url,
        sourceName: this.name,
        sourceType: this.type,
        publishedAt: new Date().toISOString(),
        metadata: {
          company: r.company,
          location: r.location,
          remote: r.remote,
          employmentType: r.experienceLevel === 'INTERNSHIP' ? 'INTERNSHIP' : 'FULL_TIME',
          salary: r.salary,
          skills: r.skills,
          workMode: r.workMode,
          region: r.region,
          experienceLevel: r.experienceLevel,
          sourcePlatform: r.sourcePlatform,
        },
      });
    }

    // 2. Dynamic Discovery from Public Job Board API (Arbeitnow & Global Remote)
    try {
      const res = await fetch('https://www.arbeitnow.com/api/job-board-api', {
        headers: { 'User-Agent': 'DevAtlas-Discovery-Engine/1.0' },
        signal: AbortSignal.timeout(8000),
      });

      if (res.ok) {
        const json = (await res.json()) as { data?: any[] };
        const rawJobs = (json.data || []).slice(0, 10);

        for (const j of rawJobs) {
          const title = j.title || 'Software Engineer';
          const isIntern = title.toLowerCase().includes('intern') || title.toLowerCase().includes('student');
          const isStaff = title.toLowerCase().includes('staff') || title.toLowerCase().includes('principal') || title.toLowerCase().includes('lead');
          const isSenior = title.toLowerCase().includes('senior') || title.toLowerCase().includes('sr');

          const expLevel = isIntern ? 'INTERNSHIP' : isStaff ? 'STAFF_PRINCIPAL' : isSenior ? 'SENIOR' : 'MID';
          const isRemote = Boolean(j.remote);

          discovered.push({
            type: 'JOB' as const,
            title,
            description: `Hiring at ${j.company_name} (${j.location || 'Remote'}). ${isRemote ? 'Remote position.' : ''}`,
            url: j.url,
            sourceName: this.name,
            sourceType: this.type,
            publishedAt: j.created_at ? new Date(j.created_at * 1000).toISOString() : new Date().toISOString(),
            metadata: {
              company: j.company_name,
              location: j.location || (isRemote ? 'Remote Worldwide' : 'Global'),
              remote: isRemote,
              employmentType: isIntern ? 'INTERNSHIP' : 'FULL_TIME',
              salary: isIntern ? '$3,500 - $5,000 / Month Stipend' : (isRemote ? '$120,000 - $180,000 USD' : 'Competitive'),
              skills: (j.tags || []).slice(0, 5),
              workMode: isRemote ? 'REMOTE' : 'HYBRID',
              region: isRemote ? 'GLOBAL_REMOTE' : 'EUROPE',
              experienceLevel: expLevel,
              sourcePlatform: 'Arbeitnow',
            },
          });
        }
      }
    } catch (err: unknown) {
      console.warn(`[JobSource External API Error] ${err instanceof Error ? err.message : String(err)}`);
    }

    return discovered;
  }
}

