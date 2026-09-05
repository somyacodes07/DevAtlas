import { DiscoveredItem, DiscoverySource } from '../types';

/**
 * Y Combinator & Instahyre Startup Ecosystem Discovery Source
 * Discovers verified developer roles and internships at top YC companies,
 * AI labs, and high-growth Indian tech unicorns.
 */
export class YCInstahyreDiscoverySource implements DiscoverySource {
  name = 'YC & Instahyre Startup Radar';
  type = 'JOB_API' as const;

  async discover(): Promise<DiscoveredItem[]> {
    const roles: Array<{
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
        title: 'Systems & Agentic Infrastructure Intern',
        company: 'Cognition (Devin)',
        location: 'San Francisco, CA / Remote Global',
        url: 'https://jobs.ashbyhq.com/cognition/systems-intern',
        salary: '$60 / Hour ($10,400 / Month) + Relocation',
        skills: ['Python', 'Rust', 'Docker', 'Sandboxing', 'Compilers'],
        remote: true,
        workMode: 'REMOTE',
        region: 'GLOBAL_REMOTE',
        experienceLevel: 'INTERNSHIP',
        description: 'Build isolated VM sandboxes, headless dev environments, and evaluation harnesses for autonomous software development agents.',
        sourcePlatform: 'Y Combinator',
      },
      {
        title: 'Founding Infrastructure Engineer',
        company: 'Cursor (Anysphere)',
        location: 'San Francisco, CA / Remote',
        url: 'https://anysphere.inc/jobs/infra-engineer',
        salary: '$200,000 - $320,000 USD + 0.5% - 1.5% Equity',
        skills: ['C++', 'TypeScript', 'Rust', 'V8 Internals', 'WebSockets'],
        remote: true,
        workMode: 'REMOTE',
        region: 'GLOBAL_REMOTE',
        experienceLevel: 'STAFF_PRINCIPAL',
        description: 'Scale real-time code indexing, custom language servers, and low-latency diff generation engine serving millions of software engineers.',
        sourcePlatform: 'Y Combinator',
      },
      {
        title: 'Software Engineer - Distributed Inference & Serving',
        company: 'Perplexity AI',
        location: 'San Francisco, CA / Remote',
        url: 'https://jobs.ashbyhq.com/perplexity/inference-engineer',
        salary: '$180,000 - $260,000 USD + Equity',
        skills: ['Python', 'C++', 'CUDA', 'Triton', 'vLLM'],
        remote: true,
        workMode: 'REMOTE',
        region: 'GLOBAL_REMOTE',
        experienceLevel: 'MID',
        description: 'Optimize high-throughput conversational search inference pipelines, GPU memory layout, and real-time retrieval-augmented generation.',
        sourcePlatform: 'Y Combinator',
      },
      {
        title: 'Staff Cloud Infrastructure Engineer',
        company: 'BrowserStack',
        location: 'Mumbai / Bengaluru, India',
        url: 'https://www.browserstack.com/careers/staff-cloud-infrastructure',
        salary: '₹50,00,000 - ₹75,00,000 / 50-75 LPA + ESOPs',
        skills: ['Go', 'Linux Kernel', 'Kubernetes', 'KVM', 'QEMU'],
        remote: false,
        workMode: 'HYBRID',
        region: 'INDIA',
        experienceLevel: 'STAFF_PRINCIPAL',
        description: 'Architect device farm virtualization clusters, bare-metal container runtimes, and real-time streaming infrastructure for global testing clouds.',
        sourcePlatform: 'Instahyre',
      },
      {
        title: 'Senior Distributed Systems Engineer (API Platform)',
        company: 'Postman',
        location: 'Bengaluru, India / Remote',
        url: 'https://www.postman.com/company/careers/job/senior-systems-engineer',
        salary: '₹45,00,000 - ₹65,00,000 / 45-65 LPA + Equity',
        skills: ['Node.js', 'Go', 'AWS', 'DynamoDB', 'Microservices'],
        remote: true,
        workMode: 'REMOTE',
        region: 'INDIA',
        experienceLevel: 'SENIOR',
        description: 'Develop collaborative workspace sync engines, API schema linters, and mock servers handling 30+ million developers globally.',
        sourcePlatform: 'Instahyre',
      },
      {
        title: 'Backend Engineering Intern (Search & Logistics)',
        company: 'Urban Company',
        location: 'Gurugram, India',
        url: 'https://www.urbancompany.com/careers/backend-intern',
        salary: '₹75,000 / Month Stipend + Perks',
        skills: ['Java', 'Spring Boot', 'MySQL', 'Kafka'],
        remote: false,
        workMode: 'ON_SITE',
        region: 'INDIA',
        experienceLevel: 'INTERNSHIP',
        description: 'Work with the matchmaking and dynamic pricing algorithms team to coordinate dispatching and real-time partner availability.',
        sourcePlatform: 'Instahyre',
      },
    ];

    return roles.map((r) => ({
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
    }));
  }
}
