'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CheckIcon from '@mui/icons-material/Check';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import PersonIcon from '@mui/icons-material/Person';
import LanguageIcon from '@mui/icons-material/Language';
import Footer from '@/components/Footer';

const Check = CheckIcon;
const CreditCard = CreditCardIcon;
const Smartphone = SmartphoneIcon;
const User = PersonIcon;
const Globe = LanguageIcon;
import { useToast } from '@/components/ToastProvider';

interface ProductOption {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  priceLabel: string;
  icon: React.ReactNode;
  features: string[];
  popular?: boolean;
  disabled?: boolean;
  disabledMessage?: string;
}

// List of countries that allow physical cards (can be fetched from admin panel)
const ALLOWED_PHYSICAL_CARD_COUNTRIES = ['India', 'UAE', 'USA', 'UK'];

export default function ProductSelectionPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [userCountry, setUserCountry] = useState<string>('India');
  const [loading, setLoading] = useState(false);
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);

  useEffect(() => {
    // Get user's country from localStorage (set during onboarding)
    const userProfile = localStorage.getItem('userProfile');
    if (userProfile) {
      try {
        const profile = JSON.parse(userProfile);
        setUserCountry(profile.country || 'India');
      } catch (error) {
        console.error('Error parsing user profile:', error);
      }
    }

    // Fetch plans from API
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setPlansLoading(true);
      const response = await fetch('/api/plans/active');
      const data = await response.json();

      if (data.success && data.plans) {
        // Map database plans to ProductOption format
        const mappedPlans = data.plans.map((plan: any) => {
          const isPhysicalCardAllowed = plan.allowed_countries?.includes(userCountry) ?? true;

          // Determine icon based on plan type
          let icon = <User className="w-6 h-6" />;
          if (plan.type === 'physical-digital') {
            icon = <CreditCard className="w-6 h-6" />;
          } else if (plan.type === 'digital-with-app') {
            icon = <Smartphone className="w-6 h-6" />;
          }

          // Determine price label
          let priceLabel = 'Free';
          if (plan.popular) {
            priceLabel = 'Most Popular';
          } else if (plan.type === 'digital-with-app') {
            priceLabel = 'Best Value';
          }

          return {
            id: plan.type,
            title: plan.name,
            subtitle: plan.description,
            price: `$${plan.price}`,
            priceLabel: priceLabel,
            icon: icon,
            features: plan.features || [],
            popular: plan.popular || false,
            disabled: plan.type === 'physical-digital' && !isPhysicalCardAllowed,
            disabledMessage: `Physical cards are not available in ${userCountry}. Please choose a digital option.`
          };
        });

        setProductOptions(mappedPlans);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      // Fallback to default plans if API fails
      setProductOptions(getDefaultPlans());
    } finally {
      setPlansLoading(false);
    }
  };

  const getDefaultPlans = (): ProductOption[] => {
    const isPhysicalCardAllowed = ALLOWED_PHYSICAL_CARD_COUNTRIES.includes(userCountry);

    return [
      {
        id: 'physical-digital',
        title: 'Physical NFC Card + Linkist App',
        subtitle: '1 year subscription & AI Credits',
        price: '$29',
        priceLabel: 'Most Popular',
        icon: <CreditCard className="w-6 h-6" />,
        features: [
          'Premium NFC Card',
          'Linkist App Access (1 Year)',
          'AI Credits worth $50',
          'Unlimited Profile Updates',
          'Analytics Dashboard',
          'Priority Support'
        ],
        popular: true,
        disabled: !isPhysicalCardAllowed,
        disabledMessage: `Physical cards are not available in ${userCountry}. Please choose a digital option.`
      },
      {
        id: 'digital-with-app',
        title: 'Digital Profile + Linkist App',
        subtitle: '1 year subscription & AI Credits',
        price: '$19',
        priceLabel: 'Best Value',
        icon: <Smartphone className="w-6 h-6" />,
        features: [
          'Digital Business Card',
          'Linkist App Access (1 Year)',
          'AI Credits worth $30',
          'Unlimited Profile Updates',
          'Analytics Dashboard',
          'Email Support'
        ]
      },
      {
        id: 'digital-only',
        title: 'Digital Profile Only',
        subtitle: 'Digital Profile Without Linkist App',
        price: '$0',
        priceLabel: 'Free',
        icon: <User className="w-6 h-6" />,
        features: [
          'Digital profile',
          'Basic analytics',
          'Profile customization',
          'Standard support'
        ]
      }
    ];
  };

  const handleCardClick = (productId: string) => {
    const product = productOptions.find(p => p.id === productId);

    if (product?.disabled) {
      showToast(product.disabledMessage || 'This option is not available', 'error');
      return;
    }

    // Just select the card, don't navigate yet
    setSelectedProduct(productId);
  };

  const handleConfirmSelection = async () => {
    if (!selectedProduct) {
      showToast('Please select a plan first', 'error');
      return;
    }

    setLoading(true);

    // Store the selection
    localStorage.setItem('productSelection', selectedProduct);

    // Route based on product type
    if (selectedProduct === 'digital-only') {
      // Digital Profile Only → Create order in database and redirect to success page
      const userProfile = localStorage.getItem('userProfile');
      let email = '';
      let firstName = 'User';
      let lastName = 'Name';
      let phoneNumber = '';
      let country = 'US';

      if (userProfile) {
        try {
          const profile = JSON.parse(userProfile);
          email = profile.email || '';
          firstName = profile.firstName || 'User';
          lastName = profile.lastName || 'Name';
          phoneNumber = profile.mobile || '';
          country = profile.country || 'US';
        } catch (error) {
          console.error('Error parsing user profile:', error);
        }
      }

      // Create order data for digital-only product (FREE - $0)
      const digitalOnlyPrice = 0;
      const taxAmount = 0;
      const totalAmount = 0;

      const cardConfig = {
        firstName,
        lastName,
        baseMaterial: 'digital',
        color: 'none',
        quantity: 1,
        isDigitalOnly: true,
        fullName: `${firstName} ${lastName}`
      };

      const checkoutData = {
        fullName: `${firstName} ${lastName}`,
        email,
        phoneNumber,
        country,
        addressLine1: 'N/A - Digital Product',
        addressLine2: '',
        city: 'N/A',
        state: 'N/A',
        postalCode: 'N/A'
      };

      try {
        // Call API to create order in database
        const response = await fetch('/api/process-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cardConfig,
            checkoutData,
            paymentData: null, // No payment needed for free tier
            pricing: {
              subtotal: digitalOnlyPrice,
              shipping: 0,
              tax: taxAmount,
              total: totalAmount
            }
          }),
        });

        const result = await response.json();

        if (result.success && result.order) {
          // Order created successfully in database
          const digitalOnlyOrder = {
            orderId: result.order.id,
            orderNumber: result.order.orderNumber,
            customerName: `${firstName} ${lastName}`,
            email,
            phoneNumber,
            cardConfig,
            shipping: {
              fullName: `${firstName} ${lastName}`,
              email,
              phone: phoneNumber,
              phoneNumber,
              country,
              addressLine1: 'N/A - Digital Product',
              city: 'N/A',
              postalCode: 'N/A',
              isFounderMember: false
            },
            pricing: {
              subtotal: digitalOnlyPrice,
              taxAmount: taxAmount,
              shippingCost: 0,
              total: totalAmount
            },
            isDigitalProduct: true,
            isDigitalOnly: true
          };

          // Store order confirmation for success page
          localStorage.setItem('orderConfirmation', JSON.stringify(digitalOnlyOrder));

          // Redirect to success page
          router.push('/nfc/success');
        } else {
          showToast(result.error || 'Failed to create order', 'error');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error creating order:', error);
        showToast('Failed to create order. Please try again.', 'error');
        setLoading(false);
      }
    } else if (selectedProduct === 'digital-with-app') {
      // Digital Profile + Linkist App → Payment page directly
      setTimeout(() => {
        const userProfile = localStorage.getItem('userProfile');
        let email = '';
        let firstName = 'User';
        let lastName = 'Name';
        let phoneNumber = '';
        let country = 'US';

        if (userProfile) {
          try {
            const profile = JSON.parse(userProfile);
            email = profile.email || '';
            firstName = profile.firstName || 'User';
            lastName = profile.lastName || 'Name';
            phoneNumber = profile.mobile || '';
            country = profile.country || 'US';
          } catch (error) {
            console.error('Error parsing user profile:', error);
          }
        }

        // Create minimal order for digital product (no physical shipping needed)
        const digitalProfilePrice = 59;
        const subscriptionPrice = 120;
        const taxableAmount = digitalProfilePrice; // Only tax on digital profile
        const taxAmount = country === 'IN' ? taxableAmount * 0.18 : taxableAmount * 0.05;
        const totalAmount = digitalProfilePrice + subscriptionPrice + taxAmount;

        const digitalOrder = {
          orderId: `digital-${Date.now()}`, // Temporary ID
          orderNumber: `DIG-${Date.now()}`,
          customerName: `${firstName} ${lastName}`,
          email,
          phoneNumber,
          productName: 'Digital Profile + Linkist App',
          cardConfig: {
            firstName,
            lastName,
            baseMaterial: 'digital',
            color: 'none',
            quantity: 1,
            isDigitalOnly: true,
            fullName: `${firstName} ${lastName}`
          },
          shipping: {
            country,
            addressLine1: 'N/A - Digital Product',
            city: 'N/A',
            postalCode: 'N/A'
          },
          pricing: {
            digitalProfilePrice: digitalProfilePrice,
            subscriptionPrice: subscriptionPrice,
            subtotal: digitalProfilePrice + subscriptionPrice,
            taxAmount: taxAmount,
            shippingCost: 0,
            total: totalAmount
          },
          isDigitalProduct: true
        };

        localStorage.setItem('pendingOrder', JSON.stringify(digitalOrder));
        router.push('/nfc/payment');
      }, 500);
    } else if (selectedProduct === 'physical-digital') {
      // Physical Card + Digital Profile → Configure page
      setTimeout(() => {
        router.push('/nfc/configure');
      }, 500);
    } else {
      // Default fallback
      setTimeout(() => {
        router.push('/nfc/configure');
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 flex-grow">
        {/* Title Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Choose Your Linkist Experience
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select the perfect plan for your professional networking needs
          </p>

          {!ALLOWED_PHYSICAL_CARD_COUNTRIES.includes(userCountry) && (
            <div className="mt-4 inline-flex items-center gap-2 bg-amber-50 text-amber-800 px-4 py-2 rounded-lg">
              <Globe className="w-5 h-5" />
              <span className="text-sm font-medium">
                Physical cards are currently not available in {userCountry}
              </span>
            </div>
          )}
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {plansLoading ? (
            // Loading skeleton
            [1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border-2 border-gray-200 p-4 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-full mb-3"></div>
                <div className="h-5 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-3 w-2/3"></div>
                <div className="h-6 bg-gray-200 rounded mb-2 w-1/3"></div>
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))
          ) : (
            productOptions.map((option) => (
            <div
              key={option.id}
              onClick={() => !option.disabled && handleCardClick(option.id)}
              className={`relative rounded-2xl border-2 transition-all ${
                selectedProduct === option.id
                  ? 'border-red-600 shadow-2xl scale-105 ring-2 ring-red-600 ring-offset-4 cursor-pointer'
                  : option.disabled
                  ? 'border-gray-200 opacity-60 cursor-not-allowed'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-lg cursor-pointer'
              }`}
            >
              {/* Popular Badge */}
              {option.popular && !option.disabled && (
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-20">
                  <span className="bg-red-600 text-white px-4 py-1 rounded-full text-xs font-semibold shadow-lg">
                    MOST POPULAR
                  </span>
                </div>
              )}

              {/* Disabled Overlay */}
              {option.disabled && (
                <div className="absolute inset-0 bg-white/80 rounded-2xl z-10 flex items-center justify-center p-6 pointer-events-none">
                  <div className="text-center">
                    <Globe className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">Not available in your region</p>
                    <p className="text-sm text-gray-500 mt-2">{option.disabledMessage}</p>
                  </div>
                </div>
              )}

              <div className={`${option.popular && !option.disabled ? 'pt-6 px-4 pb-4' : 'p-4'}`}>
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-3 ${
                  option.popular && !option.disabled ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {option.icon}
                </div>

                {/* Title & Subtitle */}
                <h3 className="text-base font-bold text-gray-900 mb-1">
                  {option.title}
                </h3>
                <p className="text-xs text-gray-600 mb-3">
                  {option.subtitle}
                </p>

                {/* Price */}
                <div className="mb-3">
                  <p className="text-xl font-bold text-gray-900">
                    {option.price}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {option.priceLabel}
                  </p>
                </div>

                {/* Features */}
                <ul className="space-y-1.5">
                  {option.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-center gap-4 min-h-[52px] -ml-8">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors cursor-pointer"
          >
            ← Go Back
          </button>

          <button
            onClick={handleConfirmSelection}
            disabled={loading || !selectedProduct}
            className={`px-8 py-3 rounded-xl font-semibold transition-all cursor-pointer disabled:cursor-not-allowed ${
              selectedProduct
                ? 'shadow-lg hover:shadow-xl opacity-100'
                : 'opacity-0 pointer-events-none'
            }`}
            style={{ backgroundColor: '#DC2626', color: '#FFFFFF' }}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              'Continue →'
            )}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}