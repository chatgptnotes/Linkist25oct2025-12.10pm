'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LayersIcon from '@mui/icons-material/Layers';
import CloseIcon from '@mui/icons-material/Close';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SmartphoneIcon from '@mui/icons-material/Smartphone';

// Icon aliases
const Package = Inventory2Icon;
const Search = SearchIcon;
const Filter = FilterListIcon;
const Plus = AddIcon;
const MoreVertical = MoreVertIcon;
const Edit = EditIcon;
const Trash2 = DeleteIcon;
const Eye = VisibilityIcon;
const Tag = LocalOfferIcon;
const DollarSign = AttachMoneyIcon;
const Layers = LayersIcon;
const X = CloseIcon;
const CreditCard = CreditCardIcon;
const Smartphone = SmartphoneIcon;

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  status: 'active' | 'inactive' | 'draft';
  image?: string;
  createdAt: string;
  updatedAt: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  type: 'physical-digital' | 'digital-with-app' | 'digital-only';
  price: number;
  gst_percentage: number;
  vat_percentage: number;
  description: string;
  features: string[];
  status: 'active' | 'inactive' | 'draft';
  popular: boolean;
  allowed_countries: string[];
  created_at: string;
  updated_at: string;
}

type TabType = 'products' | 'plans';

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('plans');
  const [products, setProducts] = useState<Product[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'physical-digital' as 'physical-digital' | 'digital-with-app' | 'digital-only',
    price: 0,
    gst_percentage: 18,
    vat_percentage: 5,
    description: '',
    features: [''],
    status: 'draft' as 'active' | 'inactive' | 'draft',
    popular: false,
    allowed_countries: ['India', 'UAE', 'USA', 'UK']
  });

  // Mock products data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // Mock products (keeping existing data)
    setProducts([
      {
        id: '1',
        name: 'Premium NFC Card',
        description: 'High-quality metal NFC business card with custom design',
        price: 29.99,
        category: 'NFC Cards',
        stock: 150,
        status: 'active',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-20T14:30:00Z'
      },
      {
        id: '2',
        name: 'Standard NFC Card',
        description: 'Classic plastic NFC card with contactless sharing',
        price: 19.99,
        category: 'NFC Cards',
        stock: 300,
        status: 'active',
        createdAt: '2024-01-10T09:00:00Z',
        updatedAt: '2024-01-18T11:15:00Z'
      },
      {
        id: '3',
        name: 'Wooden NFC Card',
        description: 'Eco-friendly wooden NFC card with natural finish',
        price: 34.99,
        category: 'NFC Cards',
        stock: 75,
        status: 'active',
        createdAt: '2024-01-20T16:00:00Z',
        updatedAt: '2024-01-25T10:45:00Z'
      }
    ]);

    // Fetch plans from API
    try {
      const response = await fetch('/api/admin/plans');
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans || []);
      } else {
        console.error('Failed to fetch plans, using empty array');
        setPlans([]);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      setPlans([]);
    }

    setLoading(false);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plan.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || plan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanTypeIcon = (type: string) => {
    switch (type) {
      case 'physical-digital': return <CreditCard className="h-5 w-5" />;
      case 'digital-with-app': return <Smartphone className="h-5 w-5" />;
      case 'digital-only': return <Package className="h-5 w-5" />;
      default: return <Package className="h-5 w-5" />;
    }
  };

  const getPlanTypeLabel = (type: string) => {
    switch (type) {
      case 'physical-digital': return 'Physical + Digital';
      case 'digital-with-app': return 'Digital + App';
      case 'digital-only': return 'Digital Only';
      default: return type;
    }
  };

  const handleAddFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, '']
    });
  };

  const handleRemoveFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      features: newFeatures.length > 0 ? newFeatures : ['']
    });
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({
      ...formData,
      features: newFeatures
    });
  };

  const handleCountryToggle = (country: string) => {
    const newCountries = formData.allowed_countries.includes(country)
      ? formData.allowed_countries.filter(c => c !== country)
      : [...formData.allowed_countries, country];

    setFormData({
      ...formData,
      allowed_countries: newCountries
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!formData.name || !formData.description || formData.price <= 0) {
      alert('Please fill all required fields');
      return;
    }

    const validFeatures = formData.features.filter(f => f.trim() !== '');
    if (validFeatures.length === 0) {
      alert('Please add at least one feature');
      return;
    }

    try {
      const endpoint = selectedPlan ? '/api/admin/plans' : '/api/admin/plans';
      const method = selectedPlan ? 'PUT' : 'POST';

      const payload = {
        ...(selectedPlan && { id: selectedPlan.id }),
        name: formData.name,
        type: formData.type,
        price: formData.price,
        gst_percentage: formData.gst_percentage,
        vat_percentage: formData.vat_percentage,
        description: formData.description,
        features: validFeatures,
        status: formData.status,
        popular: formData.popular,
        allowed_countries: formData.allowed_countries
      };

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert(selectedPlan ? 'Plan updated successfully' : 'Plan created successfully');
        setShowAddModal(false);
        setShowEditModal(false);
        setSelectedPlan(null);
        resetForm();
        fetchData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save plan');
      }
    } catch (error) {
      console.error('Error saving plan:', error);
      alert('Failed to save plan');
    }
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      type: plan.type,
      price: plan.price,
      gst_percentage: plan.gst_percentage || 18,
      vat_percentage: plan.vat_percentage || 5,
      description: plan.description,
      features: plan.features,
      status: plan.status,
      popular: plan.popular,
      allowed_countries: plan.allowed_countries
    });
    setShowEditModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/plans?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Plan deleted successfully');
        fetchData();
      } else {
        alert('Failed to delete plan');
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      alert('Failed to delete plan');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'physical-digital',
      price: 0,
      gst_percentage: 18,
      vat_percentage: 5,
      description: '',
      features: [''],
      status: 'draft',
      popular: false,
      allowed_countries: ['India', 'UAE', 'USA', 'UK']
    });
  };

  const totalItems = activeTab === 'products' ? products.length : plans.length;
  const activeItems = activeTab === 'products'
    ? products.filter(p => p.status === 'active').length
    : plans.filter(p => p.status === 'active').length;
  const avgPrice = activeTab === 'products'
    ? (products.reduce((sum, p) => sum + p.price, 0) / products.length || 0)
    : (plans.reduce((sum, p) => sum + p.price, 0) / plans.length || 0);

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products & Plans</h1>
            <p className="text-gray-500">Manage your products and subscription plans</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setSelectedPlan(null);
              setShowAddModal(true);
            }}
            style={{ backgroundColor: '#dc2626' }}
            className="flex items-center gap-2 px-6 py-2.5 text-white rounded-lg hover:bg-red-700 font-medium shadow-lg transition-all border-2 border-red-700"
          >
            <Plus className="h-5 w-5 text-white" />
            <span className="text-white font-semibold">Add Plan</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('plans')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'plans'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Subscription Plans
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'products'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Physical Products
            </button>
          </nav>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-full">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total {activeTab === 'products' ? 'Products' : 'Plans'}</p>
                <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-full">
                <Tag className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{activeItems}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-full">
                <Layers className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {activeTab === 'products' ? 'Categories' : 'Featured'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeTab === 'products'
                    ? new Set(products.map(p => p.category)).size
                    : plans.filter(p => p.popular).length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-full">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Price</p>
                <p className="text-2xl font-bold text-gray-900">${avgPrice.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {activeTab === 'products' ? 'Product' : 'Plan'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {activeTab === 'products' ? 'Category' : 'Type'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {activeTab === 'products' ? 'Stock' : 'Features'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-500">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : activeTab === 'products' ? (
                  filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        No products found
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Package className="h-5 w-5 text-gray-500" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500">{product.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">{product.category}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-900">${product.price}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">{product.stock} units</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                            {product.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button className="text-blue-600 hover:text-blue-800">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-800">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-800">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )
                ) : (
                  filteredPlans.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        No plans found. Click "Add Plan" to create one.
                      </td>
                    </tr>
                  ) : (
                    filteredPlans.map((plan) => (
                      <tr key={plan.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                              {getPlanTypeIcon(plan.type)}
                              <span className="text-white">{getPlanTypeIcon(plan.type)}</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 flex items-center">
                                {plan.name}
                                {plan.popular && (
                                  <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">Popular</span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">{plan.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">{getPlanTypeLabel(plan.type)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-900">${plan.price}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">{plan.features.length} features</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
                            {plan.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleEdit(plan)}
                              className="text-gray-600 hover:text-gray-800"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(plan.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Plan Modal */}
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedPlan ? 'Edit Plan' : 'Add New Plan'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      setSelectedPlan(null);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Plan Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Plan Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="e.g., Physical NFC Card + Linkist App"
                      required
                    />
                  </div>

                  {/* Plan Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Plan Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    >
                      <option value="physical-digital">Physical NFC Card + Digital</option>
                      <option value="digital-with-app">Digital Profile + App</option>
                      <option value="digital-only">Digital Profile Only</option>
                    </select>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (USD) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="29.00"
                      required
                    />
                  </div>

                  {/* GST and VAT */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* GST Percentage */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        GST (%) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={formData.gst_percentage}
                        onChange={(e) => setFormData({ ...formData, gst_percentage: parseFloat(e.target.value) || 0 })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="18"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Default: 18%</p>
                    </div>

                    {/* VAT Percentage */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        VAT (%) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={formData.vat_percentage}
                        onChange={(e) => setFormData({ ...formData, vat_percentage: parseFloat(e.target.value) || 0 })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="5"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Default: 5%</p>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="1 year subscription & AI Credits"
                      required
                    />
                  </div>

                  {/* Features */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Features *
                    </label>
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => handleFeatureChange(index, e.target.value)}
                          className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                          placeholder="e.g., Premium NFC Card"
                        />
                        {formData.features.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(index)}
                            className="px-3 py-2 text-red-600 hover:text-red-800"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddFeature}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      + Add Feature
                    </button>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  {/* Popular */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="popular"
                      checked={formData.popular}
                      onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                      className="h-4 w-4 text-red-600 border-gray-300 rounded"
                    />
                    <label htmlFor="popular" className="ml-2 text-sm text-gray-700">
                      Mark as Popular (adds "Most Popular" badge)
                    </label>
                  </div>

                  {/* Allowed Countries */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Allowed Countries
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['India', 'UAE', 'USA', 'UK'].map((country) => (
                        <label key={country} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.allowed_countries.includes(country)}
                            onChange={() => handleCountryToggle(country)}
                            className="h-4 w-4 text-red-600 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">{country}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setShowEditModal(false);
                        setSelectedPlan(null);
                        resetForm();
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-800"
                    >
                      {selectedPlan ? 'Update Plan' : 'Create Plan'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
