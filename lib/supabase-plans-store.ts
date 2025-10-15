import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Admin client with service role key for full access
const getAdminClient = () => {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

export interface SubscriptionPlan {
  id: string;
  name: string;
  type: 'physical-digital' | 'digital-with-app' | 'digital-only';
  price: number;
  description: string;
  features: string[];
  status: 'active' | 'inactive' | 'draft';
  popular: boolean;
  allowed_countries: string[];
  created_at: string;
  updated_at: string;
}

export interface CreatePlanData {
  name: string;
  type: 'physical-digital' | 'digital-with-app' | 'digital-only';
  price: number;
  description: string;
  features: string[];
  status?: 'active' | 'inactive' | 'draft';
  popular?: boolean;
  allowed_countries?: string[];
}

export interface UpdatePlanData extends Partial<CreatePlanData> {}

export const SupabasePlansStore = {
  /**
   * Get all subscription plans
   */
  async getAll(): Promise<SubscriptionPlan[]> {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching plans:', error);
      throw new Error(`Failed to fetch plans: ${error.message}`);
    }

    return data as SubscriptionPlan[];
  },

  /**
   * Get active subscription plans (for public use)
   */
  async getActive(): Promise<SubscriptionPlan[]> {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('status', 'active')
      .order('price', { ascending: true });

    if (error) {
      console.error('Error fetching active plans:', error);
      throw new Error(`Failed to fetch active plans: ${error.message}`);
    }

    return data as SubscriptionPlan[];
  },

  /**
   * Get plan by ID
   */
  async getById(id: string): Promise<SubscriptionPlan | null> {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching plan:', error);
      throw new Error(`Failed to fetch plan: ${error.message}`);
    }

    return data as SubscriptionPlan;
  },

  /**
   * Create a new subscription plan
   */
  async create(planData: CreatePlanData): Promise<SubscriptionPlan> {
    const supabase = getAdminClient();

    const newPlan = {
      name: planData.name,
      type: planData.type,
      price: planData.price,
      description: planData.description,
      features: planData.features,
      status: planData.status || 'draft',
      popular: planData.popular || false,
      allowed_countries: planData.allowed_countries || ['India', 'UAE', 'USA', 'UK'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('subscription_plans')
      .insert([newPlan])
      .select()
      .single();

    if (error) {
      console.error('Error creating plan:', error);
      throw new Error(`Failed to create plan: ${error.message}`);
    }

    return data as SubscriptionPlan;
  },

  /**
   * Update an existing subscription plan
   */
  async update(id: string, planData: UpdatePlanData): Promise<SubscriptionPlan> {
    const supabase = getAdminClient();

    const updateData = {
      ...planData,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('subscription_plans')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating plan:', error);
      throw new Error(`Failed to update plan: ${error.message}`);
    }

    return data as SubscriptionPlan;
  },

  /**
   * Delete a subscription plan
   */
  async delete(id: string): Promise<void> {
    const supabase = getAdminClient();

    const { error } = await supabase
      .from('subscription_plans')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting plan:', error);
      throw new Error(`Failed to delete plan: ${error.message}`);
    }
  },

  /**
   * Get plan statistics
   */
  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    draft: number;
    avgPrice: number;
  }> {
    const plans = await this.getAll();

    return {
      total: plans.length,
      active: plans.filter(p => p.status === 'active').length,
      inactive: plans.filter(p => p.status === 'inactive').length,
      draft: plans.filter(p => p.status === 'draft').length,
      avgPrice: plans.length > 0
        ? plans.reduce((sum, p) => sum + p.price, 0) / plans.length
        : 0
    };
  }
};
