export interface Tool {
  id: string
  name: string
  description: string
  category: string
  icon: string
  tags: string[]
  new?: boolean
  popular?: boolean
  /** 'local' = runs entirely in browser. 'network' = makes requests to external services. Defaults to 'local'. */
  privacy?: 'local' | 'network'
  /** Short note shown in the network warning banner (network tools only). */
  networkNote?: string
  /** Override page <title>. Falls back to "Free {name} Online — Fast & Secure | DevTools Online". */
  seoTitle?: string
  /** Override meta description (max ~155 chars). Falls back to generated description. */
  seoDescription?: string
  /** Whether the tool supports compressing state into the URL for sharing. */
  supportsShare?: boolean;
  suggestedTools?: string[];
  howToUse?: string;
  commonErrors?: string;
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
}
