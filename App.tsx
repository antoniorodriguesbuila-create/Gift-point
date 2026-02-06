
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  LayoutDashboard, 
  History, 
  Settings, 
  Bell, 
  LogOut, 
  PlusCircle, 
  ChevronLeft,
  CreditCard,
  Banknote,
  Printer, 
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Tag,
  Filter,
  X,
  Plus,
  Minus,
  Users,
  UserCog,
  Search,
  Phone,
  Barcode,
  Trash2,
  Gift,
  MapPin,
  Sparkles,
  ArrowRight,
  Clock,
  Percent,
  Coins,
  Save,
  Lock,
  Unlock,
  Shield,
  Eye,
  Briefcase,
  Check,
  Copy,
  MessageCircle,
  HelpCircle,
  Palette,
  MoveHorizontal,
  Mail,
  User as UserIcon,
  IdCard,
  ShieldCheck,
  EyeOff,
  RefreshCw,
  Info,
  Database,
  ChevronRight
} from 'lucide-react';
import { User, GiftCard, Sale, AppNotification, GiftCardType, PaymentMethod, UserRole, StockLog } from './types';
// Added SUPPORT_NUMBER to the constants import list
import { INITIAL_INVENTORY, VENDOR_KEY, SALES_KEY, INVENTORY_KEY, MASTER_ADMIN_EMAIL, MASTER_ADMIN_PASSWORD, SUPPORT_NUMBER } from './constants';

// --- Constants ---
const ALL_USERS_KEY = 'giftpoint_all_users';
const CONFIG_KEY = 'giftpoint_global_config';

const CARD_COLORS = [
  'bg-rose-600', 'bg-emerald-600', 'bg-blue-600', 'bg-amber-500', 
  'bg-indigo-600', 'bg-slate-800', 'bg-violet-600', 'bg-orange-600'
];

// --- Components ---

const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ size = 'md', className = "" }) => {
  const containerSizes = {
    sm: "w-10 h-10 rounded-xl",
    md: "w-16 h-16 rounded-2xl",
    lg: "w-24 h-24 rounded-[32px]"
  };
  const iconSizes = {
    sm: 20,
    md: 32,
    lg: 48
  };
  
  return (
    <div className={`${containerSizes[size]} bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 flex items-center justify-center relative shadow-2xl overflow-hidden group ${className}`}>
      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative">
        <Gift className="text-white" size={iconSizes[size]} />
        <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
          <MapPin size={iconSizes[size] / 3} className="text-orange-600" fill="currentColor" />
        </div>
      </div>
    </div>
  );
};

const Button: React.FC<{
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success' | 'admin';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
  children: React.ReactNode;
}> = ({ onClick, variant = 'primary', className = '', disabled, type = 'button', children }) => {
  const baseStyles = "px-4 py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:active:scale-100";
  const variants = {
    primary: "bg-orange-600 text-white hover:bg-orange-700 shadow-xl shadow-orange-200",
    secondary: "bg-slate-800 text-white hover:bg-slate-900 shadow-xl shadow-slate-200",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xl shadow-emerald-200",
    outline: "border-2 border-slate-100 text-slate-700 hover:border-orange-600 hover:text-orange-600 hover:bg-orange-50",
    danger: "bg-rose-500 text-white hover:bg-rose-600 shadow-xl shadow-rose-200",
    ghost: "text-slate-500 hover:bg-slate-100",
    admin: "bg-gradient-to-r from-slate-800 to-slate-900 text-white border border-slate-700 hover:from-slate-900 hover:to-black shadow-xl",
  };
  return (
    <button type={type} onClick={onClick} className={`${baseStyles} ${variants[variant]} ${className}`} disabled={disabled}>
      {children}
    </button>
  );
};

const Card: React.FC<{ 
  children: React.ReactNode; 
  className?: string; 
  onClick?: () => void;
}> = ({ children, className = "", onClick }) => (
  <div 
    onClick={onClick} 
    className={`bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 p-5 ${className} ${onClick ? 'cursor-pointer active:scale-[0.98] transition-all hover:shadow-lg' : ''}`}
  >
    {children}
  </div>
);

type View = 'LOGIN' | 'SIGNUP' | 'DASHBOARD' | 'SELECT_GIFT' | 'PAYMENT' | 'HISTORY' | 'ALERTS' | 'SETTINGS' | 'RECEIPT' | 'ADMIN_DASHBOARD' | 'ADMIN_MANAGE_VENDOR' | 'ADMIN_REGISTER' | 'ADMIN_PRODUCTS' | 'ADMIN_CONFIGS';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('LOGIN');
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [inventory, setInventory] = useState<GiftCard[]>(INITIAL_INVENTORY); 
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [selectedGift, setSelectedGift] = useState<{ card: GiftCard, amount: number } | null>(null);
  const [currentSale, setCurrentSale] = useState<Sale | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedVendorForAdmin, setSelectedVendorForAdmin] = useState<User | null>(null);
  const [activeAdminStockId, setActiveAdminStockId] = useState<string | null>(null);
  const [newCodeInput, setNewCodeInput] = useState('');
  const [pinCopied, setPinCopied] = useState(false);
  const [globalCommission, setGlobalCommission] = useState(10); 
  const [distributionQty, setDistributionQty] = useState<Record<string, number>>({});
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [newProduct, setNewProduct] = useState({ type: '', value: 0, color: CARD_COLORS[0] });
  const [adminSearchTerm, setAdminSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterPrice, setFilterPrice] = useState<number | 'ALL'>('ALL');
  const [onlyInStock, setOnlyInStock] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem(VENDOR_KEY);
    const savedAllUsers = localStorage.getItem(ALL_USERS_KEY);
    const savedSales = localStorage.getItem(SALES_KEY);
    const savedInv = localStorage.getItem(INVENTORY_KEY);
    const savedConfig = localStorage.getItem(CONFIG_KEY);

    if (savedAllUsers) setAllUsers(JSON.parse(savedAllUsers));
    if (savedUser) {
      const u = JSON.parse(savedUser) as User;
      setUser(u);
      setCurrentView(u.role === 'ADMIN' ? 'ADMIN_DASHBOARD' : 'DASHBOARD');
    }
    if (savedSales) setSales(JSON.parse(savedSales));
    if (savedInv) setInventory(JSON.parse(savedInv));
    if (savedConfig) setGlobalCommission(JSON.parse(savedConfig).commission);
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem(VENDOR_KEY, JSON.stringify(user));
      setAllUsers(prev => prev.map(u => u.id === user.id ? user : u));
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(ALL_USERS_KEY, JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem(SALES_KEY, JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify({ commission: globalCommission }));
  }, [globalCommission]);

  const addNotification = useCallback((message: string, type: AppNotification['type']) => {
    const newNotif: AppNotification = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      type,
      timestamp: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
    setTimeout(() => {
      setNotifications(curr => curr.filter(n => n.id !== newNotif.id));
    }, 3000);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const email = (formData.get('email') as string).toLowerCase();
    const password = formData.get('password') as string;
    
    // Master Admin Logic
    if (email === MASTER_ADMIN_EMAIL && password === MASTER_ADMIN_PASSWORD) {
      let masterUser = allUsers.find(u => u.email.toLowerCase() === MASTER_ADMIN_EMAIL);
      if (!masterUser) {
        masterUser = { 
          id: 'u-master', 
          name: 'Administrador Master', 
          email: MASTER_ADMIN_EMAIL, 
          phoneNumber: '900000000', 
          idCardNumber: '000000000LA000', 
          balance: 0, 
          city: 'Luanda', 
          role: 'ADMIN', 
          isOwner: true,
          password: MASTER_ADMIN_PASSWORD,
          inventory: [],
          stockLogs: []
        };
        setAllUsers([masterUser, ...allUsers]);
      }
      setUser(masterUser);
      setCurrentView('ADMIN_DASHBOARD');
      addNotification('Acesso Master Autorizado!', 'SUCCESS');
      return;
    }

    const existingUser = allUsers.find(u => u.email.toLowerCase() === email && u.password === password);
    
    if (existingUser) {
      if (existingUser.isBlocked) {
        addNotification('A sua conta está suspensa pelo administrador.', 'ERROR');
        return;
      }
      setUser(existingUser);
      setCurrentView(existingUser.role === 'ADMIN' ? 'ADMIN_DASHBOARD' : 'DASHBOARD');
      addNotification(`Bem-vindo, ${existingUser.name}!`, 'SUCCESS');
    } else {
      addNotification('Credenciais inválidas ou utilizador não registado.', 'ERROR'); 
    }
  };

  const handleRegistration = (e: React.FormEvent, role: UserRole) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const newUser: User = {
      id: `U${Date.now()}`,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phoneNumber: formData.get('phoneNumber') as string,
      idCardNumber: formData.get('idCardNumber') as string,
      city: formData.get('city') as string,
      iban: formData.get('iban') as string,
      bankName: formData.get('bankName') as string,
      password: formData.get('password') as string,
      balance: 0,
      role: role,
      isOwner: false,
      isBlocked: false,
      inventory: [],
      stockLogs: []
    };

    setAllUsers(prev => [...prev, newUser]);
    addNotification(`${role === 'ADMIN' ? 'Novo Admin' : 'Novo Vendedor'} registado com sucesso.`, 'SUCCESS');
    
    if (user?.role === 'ADMIN') {
      setCurrentView('ADMIN_DASHBOARD');
    } else {
      setCurrentView('LOGIN');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(VENDOR_KEY);
    setCurrentView('LOGIN');
    addNotification('Sessão encerrada.', 'INFO');
  };

  const toggleBlockUser = (userId: string) => {
    setAllUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const newState = !u.isBlocked;
        if (selectedVendorForAdmin?.id === userId) setSelectedVendorForAdmin({...u, isBlocked: newState});
        addNotification(newState ? 'Utilizador bloqueado.' : 'Utilizador desbloqueado.', 'WARNING');
        return { ...u, isBlocked: newState };
      }
      return u;
    }));
  };

  const resetVendorStock = (userId: string) => {
    setAllUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const updated = { ...u, inventory: [] };
        if (selectedVendorForAdmin?.id === userId) setSelectedVendorForAdmin(updated);
        addNotification('Stock do vendedor foi zerado.', 'SUCCESS');
        return updated;
      }
      return u;
    }));
  };

  const addProductToGlobalStock = (giftCardId: string, codes: string[]) => {
    setInventory(prev => prev.map(item => {
      if (item.id === giftCardId) {
        const newCodes = [...item.codes, ...codes];
        return { ...item, codes: newCodes, stock: newCodes.length };
      }
      return item;
    }));
    addNotification(`${codes.length} códigos adicionados ao stock global.`, 'SUCCESS');
    setNewCodeInput('');
    setActiveAdminStockId(null);
  };

  const distributePINs = (vendorId: string, giftCardId: string) => {
    const qty = distributionQty[giftCardId] || 1;
    const globalItem = inventory.find(i => i.id === giftCardId);
    
    if (!globalItem || globalItem.codes.length < qty) {
      addNotification('Stock global insuficiente.', 'ERROR');
      return;
    }

    const pinsToDistribute = globalItem.codes.slice(0, qty);
    const remainingGlobalPins = globalItem.codes.slice(qty);

    // Update global inventory
    setInventory(prev => prev.map(item => 
      item.id === giftCardId ? { ...item, codes: remainingGlobalPins, stock: remainingGlobalPins.length } : item
    ));

    // Update vendor
    setAllUsers(prev => prev.map(u => {
      if (u.id === vendorId) {
        const vendorInv = u.inventory || [];
        const existingItemIdx = vendorInv.findIndex(i => i.id === giftCardId);
        
        const newLog: StockLog = {
          id: `L${Date.now()}`,
          giftCardId,
          type: globalItem.type,
          value: globalItem.value,
          quantity: qty,
          timestamp: new Date().toISOString()
        };

        let updatedVendorInv;
        if (existingItemIdx > -1) {
          updatedVendorInv = vendorInv.map((item, idx) => 
            idx === existingItemIdx ? { ...item, codes: [...item.codes, ...pinsToDistribute], stock: item.codes.length + pinsToDistribute.length } : item
          );
        } else {
          updatedVendorInv = [...vendorInv, { ...globalItem, codes: pinsToDistribute, stock: pinsToDistribute.length }];
        }
        
        const updatedVendor = { 
          ...u, 
          inventory: updatedVendorInv, 
          stockLogs: [newLog, ...(u.stockLogs || [])] 
        };
        if (selectedVendorForAdmin?.id === vendorId) setSelectedVendorForAdmin(updatedVendor);
        return updatedVendor;
      }
      return u;
    }));
    
    addNotification(`${qty} PINs atribuídos ao vendedor.`, 'SUCCESS');
    setDistributionQty(prev => ({ ...prev, [giftCardId]: 1 }));
  };

  const processPayment = async (method: PaymentMethod) => {
    if (!selectedGift || !user || !user.inventory) return;
    const userInvItem = user.inventory.find(i => i.id === selectedGift.card.id);
    if (!userInvItem || userInvItem.codes.length === 0) {
      addNotification('Stock esgotado para este produto.', 'ERROR');
      return;
    }
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 1200));
    
    const consumedCode = userInvItem.codes[0];
    const commission = selectedGift.amount * (globalCommission / 100);
    
    const newSale: Sale = { 
      id: `S${Date.now()}`, 
      vendorId: user.id, 
      giftCardId: selectedGift.card.id, 
      type: userInvItem.type, 
      value: selectedGift.amount, 
      status: 'COMPLETED', 
      timestamp: new Date().toISOString(), 
      paymentMethod: method, 
      generatedCode: consumedCode 
    };

    setUser({ 
      ...user, 
      balance: user.balance + commission, 
      inventory: user.inventory.map(item => 
        item.id === selectedGift.card.id ? { ...item, codes: item.codes.slice(1), stock: item.codes.length - 1 } : item
      ) 
    });
    
    setSales(prev => [newSale, ...prev]);
    setCurrentSale(newSale);
    setIsProcessing(false);
    setCurrentView('RECEIPT');
  };

  const handleAddNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `P${Date.now()}`;
    const product: GiftCard = {
      id: newId,
      type: newProduct.type,
      value: Number(newProduct.value),
      stock: 0,
      color: newProduct.color,
      codes: []
    };
    setInventory(prev => [...prev, product]);
    addNotification('Novo produto adicionado.', 'SUCCESS');
    setNewProduct({ type: '', value: 0, color: CARD_COLORS[0] });
  };

  const deleteProduct = (id: string) => {
    setInventory(prev => prev.filter(p => p.id !== id));
    addNotification('Produto removido.', 'INFO');
  };

  const filteredTeamMembers = useMemo(() => {
    return allUsers.filter(u => u.id !== user?.id).filter(u => {
      const s = adminSearchTerm.toLowerCase();
      return (
        u.name.toLowerCase().includes(s) || 
        u.role.toLowerCase().includes(s) || 
        u.idCardNumber.toLowerCase().includes(s)
      );
    });
  }, [allUsers, adminSearchTerm, user]);

  const vendorInventoryFiltered = useMemo(() => {
    if (!user || !user.inventory) return [];
    return user.inventory.filter(item => {
      const typeMatch = filterType === 'ALL' || item.type === filterType;
      const priceMatch = filterPrice === 'ALL' || item.value === Number(filterPrice);
      const stockMatch = !onlyInStock || item.stock > 0;
      return typeMatch && priceMatch && stockMatch;
    });
  }, [user, filterType, filterPrice, onlyInStock]);

  const uniqueTypes = useMemo(() => Array.from(new Set(inventory.map(i => i.type))), [inventory]);
  // Fix: Explicitly typed sort comparator arguments (a: number, b: number) to fix "The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type" error.
  const uniquePrices = useMemo(() => Array.from(new Set(inventory.map(i => i.value))).sort((a: number, b: number) => a - b), [inventory]);

  const renderView = () => {
    switch (currentView) {
      case 'LOGIN':
        return (
          <div className="flex flex-col h-full bg-white p-8">
            <div className="mt-12 mb-12 text-center">
              <div className="flex justify-center mb-6"><Logo size="lg" /></div>
              <div className="flex items-center justify-center gap-2">
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter">GiftPoint</h1>
                <Sparkles size={24} className="text-orange-500" />
              </div>
              <p className="text-slate-400 mt-2 font-bold uppercase text-[10px] tracking-[0.3em]">Premium POS Solution</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input name="email" type="email" placeholder="E-mail de Acesso" className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:border-orange-500 outline-none transition-all font-medium" required />
              </div>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input name="password" type="password" placeholder="Senha" className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:border-orange-500 outline-none transition-all font-medium" required />
              </div>
              <Button type="submit" className="w-full !py-4 text-lg mt-4 shadow-orange-100">Aceder à Conta</Button>
            </form>
            <div className="mt-auto flex flex-col gap-4 items-center">
              <button onClick={() => setCurrentView('SIGNUP')} className="text-orange-600 font-black text-xs uppercase tracking-widest hover:underline transition-all">Novo Registo de Vendedor</button>
            </div>
          </div>
        );

      case 'SIGNUP':
      case 'ADMIN_REGISTER':
        const isAdminReg = currentView === 'ADMIN_REGISTER';
        return (
          <div className={`p-8 h-full overflow-y-auto ${isAdminReg ? 'bg-slate-50' : 'bg-white'}`}>
            <div className="flex items-center gap-3 mb-8">
              <button onClick={() => setCurrentView(isAdminReg ? 'ADMIN_DASHBOARD' : 'LOGIN')} className="p-2 rounded-full bg-slate-100 text-slate-400"><ChevronLeft size={24} /></button>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {isAdminReg ? 'Novo Administrador' : 'Registo de Vendedor'}
              </h2>
            </div>
            <form onSubmit={(e) => handleRegistration(e, isAdminReg ? 'ADMIN' : 'VENDOR')} className="space-y-4">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase ml-2">Identificação Pessoal</p>
                <input name="name" placeholder="Nome Completo" className="w-full p-5 rounded-2xl bg-white border-2 border-slate-100 focus:border-orange-500 outline-none transition-all font-medium" required />
                <input name="email" type="email" placeholder="E-mail" className="w-full p-5 rounded-2xl bg-white border-2 border-slate-100 focus:border-orange-500 outline-none transition-all font-medium" required />
                <div className="grid grid-cols-2 gap-3">
                  <input name="phoneNumber" placeholder="Telemóvel" className="w-full p-5 rounded-2xl bg-white border-2 border-slate-100 focus:border-orange-500 outline-none transition-all font-medium" required />
                  <input name="idCardNumber" placeholder="Nº BI" className="w-full p-5 rounded-2xl bg-white border-2 border-slate-100 focus:border-orange-500 outline-none transition-all font-medium" required />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase ml-2">Dados Financeiros & Localização</p>
                <input name="city" placeholder="Cidade / Província" className="w-full p-5 rounded-2xl bg-white border-2 border-slate-100 focus:border-orange-500 outline-none transition-all font-medium" required />
                <input name="bankName" placeholder="Nome do Banco" className="w-full p-5 rounded-2xl bg-white border-2 border-slate-100 focus:border-orange-500 outline-none transition-all font-medium" required />
                <input name="iban" placeholder="Número IBAN" className="w-full p-5 rounded-2xl bg-white border-2 border-slate-100 focus:border-orange-500 outline-none transition-all font-medium" required />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase ml-2">Segurança</p>
                <input name="password" type="password" placeholder="Senha de Login" className="w-full p-5 rounded-2xl bg-white border-2 border-slate-100 focus:border-orange-500 outline-none transition-all font-medium" required />
              </div>
              <Button type="submit" variant={isAdminReg ? 'admin' : 'primary'} className="w-full !py-4 mt-6">
                {isAdminReg ? 'Guardar Administrador' : 'Solicitar Registo'}
              </Button>
            </form>
          </div>
        );

      case 'ADMIN_DASHBOARD':
        return (
          <div className="flex flex-col h-full bg-slate-50 pb-24">
            <header className="bg-white p-6 border-b border-slate-100 sticky top-0 z-20 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Logo size="sm" />
                <div>
                  <p className="text-[10px] font-black uppercase text-orange-600 tracking-widest leading-none">Painel de Gestão</p>
                  <h2 className="font-black text-slate-800 mt-1">{user?.name}</h2>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setCurrentView('ADMIN_PRODUCTS')} className="p-2.5 bg-slate-100 text-slate-600 rounded-full"><Database size={20} /></button>
                <button onClick={handleLogout} className="p-2.5 bg-rose-50 text-rose-500 rounded-full"><LogOut size={20} /></button>
              </div>
            </header>
            <main className="p-6 space-y-6 overflow-y-auto">
              <div className="flex gap-4">
                <Card className="flex-1 bg-white border-l-4 border-l-orange-500">
                  <p className="text-[9px] font-black text-slate-400 uppercase">Total Utilizadores</p>
                  <h3 className="text-2xl font-black text-slate-800">{allUsers.length}</h3>
                </Card>
                <Card className="flex-1 bg-white border-l-4 border-l-emerald-500">
                  <p className="text-[9px] font-black text-slate-400 uppercase">Stock Global</p>
                  <h3 className="text-2xl font-black text-slate-800">{inventory.reduce((acc, curr) => acc + curr.stock, 0)}</h3>
                </Card>
              </div>

              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Utilizadores do Sistema</h4>
                  {user?.isOwner && (
                    <button onClick={() => setCurrentView('ADMIN_REGISTER')} className="text-[9px] font-black text-orange-600 border border-orange-200 px-3 py-1 rounded-full uppercase transition-colors hover:bg-orange-600 hover:text-white">+ Admin</button>
                  )}
                </div>
                
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    value={adminSearchTerm}
                    onChange={(e) => setAdminSearchTerm(e.target.value)}
                    placeholder="Pesquisar por Nome, Cargo ou BI..." 
                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-slate-200 focus:border-orange-500 outline-none transition-all font-medium text-sm" 
                  />
                </div>

                <div className="space-y-3">
                  {filteredTeamMembers.map(member => (
                    <Card key={member.id} onClick={() => { setSelectedVendorForAdmin(member); setCurrentView('ADMIN_MANAGE_VENDOR'); }} className={`flex justify-between items-center relative overflow-hidden ${member.isBlocked ? 'opacity-60 bg-slate-100 border-dashed' : ''}`}>
                      {member.isBlocked && <div className="absolute top-0 right-0 bg-rose-500 text-white text-[8px] font-black px-2 py-0.5 rounded-bl-lg uppercase">Bloqueado</div>}
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${member.role === 'ADMIN' ? 'bg-slate-900 text-orange-400 shadow-lg' : 'bg-orange-50 text-orange-600'}`}>
                          {member.role === 'ADMIN' ? <ShieldCheck size={22} /> : <UserIcon size={22} />}
                        </div>
                        <div>
                          <p className="font-black leading-none text-slate-800">{member.name}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase mt-1.5 flex items-center gap-2">
                            {member.role} • <IdCard size={10}/> {member.idCardNumber}
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-300" />
                    </Card>
                  ))}
                  {filteredTeamMembers.length === 0 && (
                    <div className="text-center py-10">
                      <Search size={40} className="mx-auto text-slate-200 mb-3" />
                      <p className="text-slate-400 font-bold text-sm">Nenhum utilizador encontrado.</p>
                    </div>
                  )}
                </div>
              </section>
            </main>
          </div>
        );

      case 'ADMIN_MANAGE_VENDOR':
        if (!selectedVendorForAdmin) return null;
        return (
          <div className="flex flex-col h-full bg-slate-50 overflow-y-auto pb-10">
            <header className="bg-white p-6 border-b border-slate-100 flex items-center gap-4 sticky top-0 z-20">
              <button onClick={() => setCurrentView('ADMIN_DASHBOARD')} className="p-2 rounded-full bg-slate-100 text-slate-400"><ChevronLeft size={24} /></button>
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none">{selectedVendorForAdmin.name}</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">{selectedVendorForAdmin.role}</p>
              </div>
            </header>
            <main className="p-6 space-y-6">
              <div className="flex gap-4">
                <Button variant={selectedVendorForAdmin.isBlocked ? 'success' : 'danger'} onClick={() => toggleBlockUser(selectedVendorForAdmin.id)} className="flex-1 !py-3 !rounded-2xl">
                  {selectedVendorForAdmin.isBlocked ? <Unlock size={18}/> : <Lock size={18}/>}
                  {selectedVendorForAdmin.isBlocked ? 'Desbloquear' : 'Bloquear'}
                </Button>
                <Button variant="outline" onClick={() => resetVendorStock(selectedVendorForAdmin.id)} className="flex-1 !py-3 !rounded-2xl border-slate-300 text-slate-700">
                  <RefreshCw size={18}/> Reset Stock
                </Button>
              </div>

              <Card className="space-y-4">
                <div className="flex items-center gap-2 mb-2 border-b border-slate-50 pb-2">
                  <Info size={16} className="text-orange-500" />
                  <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Informações Detalhadas</h4>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">E-mail</p>
                    <p className="font-black text-slate-800 break-all">{selectedVendorForAdmin.email}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Telemóvel</p>
                    <p className="font-black text-slate-800">{selectedVendorForAdmin.phoneNumber}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Nº BI</p>
                    <p className="font-black text-slate-800">{selectedVendorForAdmin.idCardNumber}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Cidade</p>
                    <p className="font-black text-slate-800">{selectedVendorForAdmin.city}</p>
                  </div>
                  <div className="col-span-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Senha de Login</p>
                      <p className="font-black text-slate-800 tracking-wider">
                        {showPassword ? selectedVendorForAdmin.password : '••••••••'}
                      </p>
                    </div>
                    <button onClick={() => setShowPassword(!showPassword)} className="p-2 text-slate-400">
                      {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Banco / IBAN</p>
                    <p className="font-black text-slate-800">{selectedVendorForAdmin.bankName || 'Não informado'}</p>
                    <p className="font-medium text-slate-500 text-[10px] mt-0.5">{selectedVendorForAdmin.iban || 'S/ IBAN'}</p>
                  </div>
                </div>
              </Card>

              {selectedVendorForAdmin.role === 'VENDOR' && (
                <>
                  <section className="space-y-4">
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Atribuir Stock</h4>
                    <div className="space-y-3">
                      {inventory.map(item => (
                        <Card key={item.id} className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm font-black text-slate-800">{item.type} Kz {item.value.toLocaleString()}</p>
                              <p className="text-[10px] font-bold text-slate-400">Stock Global: <span className="text-orange-600">{item.stock}</span></p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                                <button onClick={() => setDistributionQty(p => ({...p, [item.id]: Math.max(1, (p[item.id] || 1) - 1)}))} className="p-2 bg-slate-50 border-r border-slate-200"><Minus size={14}/></button>
                                <span className="px-3 font-black text-xs">{distributionQty[item.id] || 1}</span>
                                <button onClick={() => setDistributionQty(p => ({...p, [item.id]: Math.min(item.stock, (p[item.id] || 1) + 1)}))} className="p-2 bg-slate-50 border-l border-slate-200"><Plus size={14}/></button>
                              </div>
                              <Button onClick={() => distributePINs(selectedVendorForAdmin.id, item.id)} disabled={item.stock === 0} className="!p-2 !rounded-xl">
                                <Plus size={20}/>
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <History size={14}/> Histórico de Abastecimento
                    </h4>
                    <div className="space-y-2">
                      {selectedVendorForAdmin.stockLogs?.map(log => (
                        <div key={log.id} className="bg-white p-3 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
                          <div>
                            <p className="text-[11px] font-black text-slate-800">{log.type} {log.value} Kz</p>
                            <p className="text-[9px] text-slate-400 font-medium">{new Date(log.timestamp).toLocaleString()}</p>
                          </div>
                          <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black">
                            +{log.quantity} PINs
                          </div>
                        </div>
                      ))}
                      {(!selectedVendorForAdmin.stockLogs || selectedVendorForAdmin.stockLogs.length === 0) && (
                        <p className="text-center py-6 text-slate-400 text-[10px] font-bold italic">Nenhum abastecimento registado.</p>
                      )}
                    </div>
                  </section>
                </>
              )}
            </main>
          </div>
        );

      case 'ADMIN_PRODUCTS':
        return (
          <div className="flex flex-col h-full bg-slate-50 overflow-y-auto pb-24">
             <header className="bg-white p-6 border-b border-slate-100 flex items-center gap-4 sticky top-0 z-20">
              <button onClick={() => setCurrentView('ADMIN_DASHBOARD')} className="p-2 rounded-full bg-slate-100 text-slate-400"><ChevronLeft size={24} /></button>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Gestão de Produtos</h2>
            </header>
            <main className="p-6 space-y-8">
              <Card className="p-6 bg-white border-2 border-orange-100">
                <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2"><PlusCircle size={18} className="text-orange-500" /> Novo Produto</h3>
                <form onSubmit={handleAddNewProduct} className="space-y-4">
                  <input value={newProduct.type} onChange={e => setNewProduct({...newProduct, type: e.target.value})} placeholder="Nome (Ex: Netflix, FreeFire)" className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-50 focus:border-orange-500 outline-none font-medium text-sm" required />
                  <input type="number" value={newProduct.value || ''} onChange={e => setNewProduct({...newProduct, value: Number(e.target.value)})} placeholder="Valor em Kz" className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-50 focus:border-orange-500 outline-none font-medium text-sm" required />
                  <div className="flex gap-2 overflow-x-auto py-2">
                    {CARD_COLORS.map(c => (
                      <button key={c} type="button" onClick={() => setNewProduct({...newProduct, color: c})} className={`w-8 h-8 rounded-full flex-shrink-0 transition-all ${c} ${newProduct.color === c ? 'ring-4 ring-orange-200 scale-110' : ''}`} />
                    ))}
                  </div>
                  <Button type="submit" className="w-full !py-3">Adicionar Produto</Button>
                </form>
              </Card>

              <section className="space-y-4">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Produtos no Catálogo</h4>
                <div className="space-y-3">
                  {inventory.map(item => (
                    <Card key={item.id} className="flex justify-between items-center group">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center text-white`}>
                          <Gift size={20}/>
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-sm">{item.type}</p>
                          <p className="text-[10px] text-slate-400 font-bold">Kz {item.value.toLocaleString()} • Stock: {item.stock}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setActiveAdminStockId(item.id); setNewCodeInput(''); }} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"><PlusCircle size={20}/></button>
                        <button onClick={() => deleteProduct(item.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={20}/></button>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            </main>

            {activeAdminStockId && (
              <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4">
                <div className="bg-white w-full max-w-md rounded-[32px] p-8 animate-in slide-in-from-bottom-10">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-slate-800">Abastecer Stock Global</h3>
                    <button onClick={() => setActiveAdminStockId(null)} className="p-2 bg-slate-100 rounded-full"><X size={20}/></button>
                  </div>
                  <p className="text-slate-500 text-xs mb-4 leading-relaxed font-medium italic">Insira os códigos um por um ou vários separados por vírgula para alimentar o sistema.</p>
                  <textarea 
                    value={newCodeInput}
                    onChange={e => setNewCodeInput(e.target.value)}
                    placeholder="Ex: PIN123, PIN456, PIN789"
                    className="w-full h-32 p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-orange-500 outline-none font-mono text-xs mb-6 resize-none"
                  />
                  <Button onClick={() => {
                    const codes = newCodeInput.split(',').map(c => c.trim()).filter(c => c !== '');
                    if (codes.length > 0) addProductToGlobalStock(activeAdminStockId, codes);
                  }} className="w-full !py-4">Confirmar Entrada de Stock</Button>
                </div>
              </div>
            )}
          </div>
        );

      case 'DASHBOARD':
        return (
          <div className="flex flex-col h-full bg-slate-50 pb-24">
            <header className="bg-white p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 z-20 shadow-sm">
              <div className="flex items-center gap-3">
                <Logo size="sm" />
                <div>
                  <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest leading-none">GiftPoint Agente</p>
                  <h2 className="text-xl font-black text-slate-800 mt-1">{user?.name}</h2>
                </div>
              </div>
              <button onClick={() => setCurrentView('ALERTS')} className="p-2.5 bg-slate-50 rounded-full text-slate-600 relative">
                <Bell size={22} />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
              </button>
            </header>
            <main className="p-6 space-y-6 overflow-y-auto">
              <Card className="bg-gradient-to-br from-orange-600 via-amber-500 to-yellow-400 text-white border-none shadow-2xl shadow-orange-100 overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-125 transition-transform"><Coins size={80}/></div>
                <div className="relative z-10">
                  <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.2em]">Comissão Acumulada</p>
                  <h3 className="text-4xl font-black tracking-tighter mt-1">Kz {user?.balance.toLocaleString()}</h3>
                  <div className="mt-4 flex gap-2">
                    <span className="bg-white/20 px-2 py-1 rounded-lg text-[9px] font-black uppercase">Agente Verificado</span>
                    <span className="bg-white/20 px-2 py-1 rounded-lg text-[9px] font-black uppercase">Ponto {user?.city}</span>
                  </div>
                </div>
              </Card>
              
              <div className="grid grid-cols-2 gap-4">
                <Card className="flex flex-col items-center justify-center gap-3 text-center border-orange-50 hover:bg-orange-50 transition-colors" onClick={() => setCurrentView('SELECT_GIFT')}>
                  <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center"><PlusCircle size={28}/></div>
                  <span className="text-[10px] font-black uppercase text-slate-700">Nova Venda</span>
                </Card>
                <Card className="flex flex-col items-center justify-center gap-3 text-center border-slate-50 hover:bg-slate-50 transition-colors" onClick={() => setCurrentView('HISTORY')}>
                  <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center"><History size={28}/></div>
                  <span className="text-[10px] font-black uppercase text-slate-700">Histórico</span>
                </Card>
              </div>

              <section className="space-y-4">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Meu Inventário Atual</h4>
                <div className="space-y-3">
                  {user?.inventory?.map(item => (
                    <Card key={item.id} className="flex justify-between items-center py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center text-white`}>
                          <Gift size={20}/>
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-sm">{item.type}</p>
                          <p className="text-[10px] text-slate-400 font-bold">Valor: Kz {item.value.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1.5 rounded-xl font-black text-xs ${item.stock > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                        {item.stock} UN
                      </div>
                    </Card>
                  ))}
                  {(!user?.inventory || user.inventory.length === 0) && (
                    <div className="text-center py-10 bg-white rounded-3xl border-2 border-dashed border-slate-100">
                      <Database size={32} className="mx-auto text-slate-200 mb-2"/>
                      <p className="text-slate-400 font-bold text-xs uppercase">Sem stock disponível.</p>
                      <button className="mt-3 text-[9px] font-black text-orange-600 underline">Contactar Admin para recarga</button>
                    </div>
                  )}
                </div>
              </section>
            </main>
          </div>
        );

      case 'SELECT_GIFT':
        return (
          <div className="flex flex-col h-full bg-slate-50 pb-24">
            <header className="bg-white p-6 border-b border-slate-100 flex items-center gap-4 sticky top-0 z-20">
              <button onClick={() => setCurrentView('DASHBOARD')} className="p-2 rounded-full bg-slate-100 text-slate-400"><ChevronLeft size={24} /></button>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Efetuar Venda</h2>
            </header>
            
            <div className="bg-white px-6 pb-6 pt-2 border-b border-slate-100 space-y-4 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Filter size={12}/> Filtros de Pesquisa</span>
                <button onClick={() => {setFilterType('ALL'); setFilterPrice('ALL'); setOnlyInStock(false);}} className="text-[10px] font-black text-rose-500 uppercase">Limpar</button>
              </div>
              
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                <button 
                  onClick={() => setFilterType('ALL')} 
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${filterType === 'ALL' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}
                >Tudo</button>
                {uniqueTypes.map(type => (
                  <button 
                    key={type} 
                    onClick={() => setFilterType(type)} 
                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${filterType === type ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}
                  >{type}</button>
                ))}
              </div>

              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                <button 
                  onClick={() => setFilterPrice('ALL')} 
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${filterPrice === 'ALL' ? 'bg-orange-600 text-white shadow-lg' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}
                >Todos Preços</button>
                {uniquePrices.map(price => (
                  <button 
                    key={price} 
                    onClick={() => setFilterPrice(price)} 
                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${filterPrice === price ? 'bg-orange-600 text-white shadow-lg' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}
                  >{price.toLocaleString()} Kz</button>
                ))}
              </div>

              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <input 
                  type="checkbox" 
                  id="stockFilter" 
                  checked={onlyInStock}
                  onChange={() => setOnlyInStock(!onlyInStock)}
                  className="w-5 h-5 accent-orange-600 rounded-lg"
                />
                <label htmlFor="stockFilter" className="text-xs font-black text-slate-600 uppercase tracking-tighter">Apenas produtos em stock</label>
              </div>
            </div>

            <main className="p-6 space-y-4 overflow-y-auto">
              {vendorInventoryFiltered.map(item => (
                <Card 
                  key={item.id} 
                  className={`flex items-center gap-4 transition-all ${item.stock === 0 ? 'opacity-50 grayscale pointer-events-none' : ''}`}
                  onClick={() => { setSelectedGift({ card: item, amount: item.value }); setCurrentView('PAYMENT'); }}
                >
                  <div className={`w-14 h-14 rounded-[18px] ${item.color} flex items-center justify-center text-white shadow-lg`}>
                    <Gift size={28}/>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-slate-800 uppercase tracking-tight leading-none">{item.type}</p>
                    <p className="text-lg font-black text-orange-600 mt-1">{item.value.toLocaleString()} Kz</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Stock</p>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black ${item.stock > 3 ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                      {item.stock} UN
                    </div>
                  </div>
                </Card>
              ))}

              {vendorInventoryFiltered.length === 0 && (
                <div className="text-center py-20">
                  <PackageSearch size={48} className="mx-auto text-slate-200 mb-4" />
                  <h3 className="text-slate-400 font-black text-sm uppercase">Nenhum produto em stock com estes filtros.</h3>
                </div>
              )}
            </main>
          </div>
        );

      case 'PAYMENT':
        if (!selectedGift) return null;
        return (
          <div className="flex flex-col h-full bg-white p-8">
            <header className="flex items-center gap-4 mb-10">
              <button onClick={() => setCurrentView('SELECT_GIFT')} className="p-2 rounded-full bg-slate-50 text-slate-400"><ChevronLeft size={24} /></button>
              <h2 className="text-xl font-black text-slate-800">Pagamento</h2>
            </header>
            
            <div className="flex-1 space-y-8">
              <Card className={`p-8 ${selectedGift.card.color} text-white border-none shadow-2xl relative overflow-hidden flex flex-col items-center justify-center text-center`}>
                <div className="absolute inset-0 bg-white/10 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 0%, transparent 40%)' }}></div>
                <Gift size={48} className="mb-4 opacity-80" />
                <h3 className="text-2xl font-black uppercase tracking-tight">{selectedGift.card.type}</h3>
                <p className="text-4xl font-black mt-2 tracking-tighter">{selectedGift.amount.toLocaleString()} Kz</p>
                <div className="mt-6 bg-black/20 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Confirme os dados antes de processar</div>
              </Card>

              <div className="space-y-4">
                <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Escolha o Método de Recebimento</p>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => processPayment('CASH')} className="flex flex-col items-center gap-3 p-6 rounded-[32px] border-2 border-slate-100 hover:border-orange-500 hover:bg-orange-50 transition-all group">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all"><Banknote size={28}/></div>
                    <span className="text-xs font-black uppercase text-slate-800">Dinheiro</span>
                  </button>
                  <button onClick={() => processPayment('CARD')} className="flex flex-col items-center gap-3 p-6 rounded-[32px] border-2 border-slate-100 hover:border-orange-500 hover:bg-orange-50 transition-all group">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all"><CreditCard size={28}/></div>
                    <span className="text-xs font-black uppercase text-slate-800">Multicaixa</span>
                  </button>
                </div>
              </div>
            </div>

            {isProcessing && (
              <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-[200] flex flex-col items-center justify-center p-10 text-center">
                <Loader2 size={60} className="text-orange-600 animate-spin mb-6" />
                <h3 className="text-2xl font-black text-slate-800">Processando Venda</h3>
                <p className="text-slate-400 mt-2 font-medium">Validando PIN e registando comissão no sistema...</p>
              </div>
            )}
          </div>
        );

      case 'RECEIPT':
        if (!currentSale) return null;
        return (
          <div className="flex flex-col h-full bg-slate-50 p-8 overflow-y-auto">
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Venda Concluída!</h2>
              <p className="text-slate-400 font-medium mb-8">O código foi libertado com sucesso.</p>

              <div className="w-full bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-100">
                <div className="bg-slate-900 p-6 text-center">
                  <p className="text-orange-400 text-[10px] font-black uppercase tracking-widest mb-1">Código do Cartão</p>
                  <div className="flex items-center justify-center gap-3">
                    <h3 className="text-2xl font-mono font-black text-white tracking-widest">{currentSale.generatedCode}</h3>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(currentSale.generatedCode || '');
                        setPinCopied(true);
                        setTimeout(() => setPinCopied(false), 2000);
                        addNotification('Código copiado!', 'SUCCESS');
                      }}
                      className="text-slate-400 hover:text-white"
                    >
                      {pinCopied ? <CheckCircle2 size={20} className="text-emerald-500"/> : <Copy size={20}/>}
                    </button>
                  </div>
                </div>
                <div className="p-8 space-y-4">
                  <div className="flex justify-between items-center border-b border-dashed border-slate-100 pb-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Produto</span>
                    <span className="font-black text-slate-800">{currentSale.type}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-dashed border-slate-100 pb-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Valor Pago</span>
                    <span className="font-black text-orange-600">Kz {currentSale.value.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-dashed border-slate-100 pb-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Pagamento</span>
                    <span className="font-black text-slate-800 flex items-center gap-2">
                      {currentSale.paymentMethod === 'CASH' ? <Banknote size={14}/> : <CreditCard size={14}/>}
                      {currentSale.paymentMethod === 'CASH' ? 'Dinheiro' : 'Cartão'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Data/Hora</span>
                    <span className="font-black text-slate-800 text-[10px]">{new Date(currentSale.timestamp).toLocaleString()}</span>
                  </div>
                </div>
                <div className="px-8 pb-8">
                  <Button variant="outline" className="w-full !rounded-2xl border-slate-200" onClick={() => window.print()}>
                    <Printer size={18}/> Imprimir Recibo
                  </Button>
                </div>
              </div>
            </div>
            <Button onClick={() => { setCurrentSale(null); setCurrentView('DASHBOARD'); }} className="mt-8 !py-4 shadow-orange-200">Voltar ao Início</Button>
          </div>
        );

      case 'HISTORY':
        const mySales = sales.filter(s => s.vendorId === user?.id);
        return (
          <div className="flex flex-col h-full bg-slate-50">
            <header className="bg-white p-6 border-b border-slate-100 sticky top-0 z-20 shadow-sm">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Histórico de Vendas</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase mt-1 tracking-widest">Relatório Completo</p>
            </header>
            <main className="flex-1 overflow-y-auto p-6 space-y-4">
              {mySales.map(sale => (
                <Card key={sale.id} className="flex justify-between items-center border-l-4 border-l-emerald-500">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                      {sale.paymentMethod === 'CASH' ? <Banknote size={20}/> : <CreditCard size={20}/>}
                    </div>
                    <div>
                      <p className="font-black text-slate-800 text-sm leading-none">{sale.type} Kz {sale.value.toLocaleString()}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase mt-1.5">{new Date(sale.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-emerald-600 uppercase">Concluída</p>
                    <p className="text-[8px] font-mono font-bold text-slate-400 mt-1">{sale.generatedCode?.substr(0, 8)}...</p>
                  </div>
                </Card>
              ))}
              {mySales.length === 0 && (
                <div className="text-center py-20 grayscale opacity-40">
                  <History size={60} className="mx-auto mb-4" />
                  <p className="text-slate-500 font-black uppercase text-xs">Sem vendas registadas ainda.</p>
                </div>
              )}
            </main>
          </div>
        );

      case 'ALERTS':
        return (
          <div className="flex flex-col h-full bg-slate-50 pb-20">
            <header className="bg-white p-6 border-b border-slate-100 sticky top-0 z-20 flex items-center gap-4">
              <button onClick={() => setCurrentView('DASHBOARD')} className="p-2 rounded-full bg-slate-100 text-slate-400"><ChevronLeft size={24} /></button>
              <h2 className="text-xl font-black text-slate-800">Notificações</h2>
            </header>
            <main className="p-6 space-y-4">
              <Card className="border-l-4 border-l-orange-500 bg-orange-50/30">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center flex-shrink-0"><Bell size={20}/></div>
                  <div>
                    <h4 className="font-black text-slate-800 text-sm">Bem-vindo ao GiftPoint!</h4>
                    <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">Comece a vender agora. Se precisar de stock extra, peça ao seu administrador para recarregar o seu inventário.</p>
                    <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase">Agora mesmo</p>
                  </div>
                </div>
              </Card>
            </main>
          </div>
        );

      case 'SETTINGS':
        return (
          <div className="flex flex-col h-full bg-slate-50 pb-24 overflow-y-auto">
            <header className="bg-white p-6 border-b border-slate-100 sticky top-0 z-20">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Configurações</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase mt-1">Gestão de Conta</p>
            </header>
            <main className="p-6 space-y-6">
              <div className="flex flex-col items-center py-6 text-center">
                <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white text-3xl font-black shadow-2xl mb-4">
                  {user?.name.charAt(0)}
                </div>
                <h3 className="text-xl font-black text-slate-800 leading-none">{user?.name}</h3>
                <p className="text-sm font-bold text-orange-600 uppercase mt-2 tracking-widest">{user?.role}</p>
              </div>

              <div className="space-y-4">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Dados Pessoais</h4>
                <div className="space-y-3">
                  <div className="bg-white p-5 rounded-3xl border border-slate-100 flex items-center gap-4">
                    <Mail className="text-slate-400" size={20}/>
                    <div><p className="text-[9px] font-bold text-slate-400 uppercase">E-mail</p><p className="font-bold text-slate-800 text-sm">{user?.email}</p></div>
                  </div>
                  <div className="bg-white p-5 rounded-3xl border border-slate-100 flex items-center gap-4">
                    <Phone className="text-slate-400" size={20}/>
                    <div><p className="text-[9px] font-bold text-slate-400 uppercase">Telemóvel</p><p className="font-bold text-slate-800 text-sm">{user?.phoneNumber}</p></div>
                  </div>
                  <div className="bg-white p-5 rounded-3xl border border-slate-100 flex items-center gap-4">
                    <IdCard className="text-slate-400" size={20}/>
                    <div><p className="text-[9px] font-bold text-slate-400 uppercase">BI</p><p className="font-bold text-slate-800 text-sm">{user?.idCardNumber}</p></div>
                  </div>
                </div>
              </div>

              <Button onClick={handleLogout} variant="danger" className="w-full !py-4 shadow-rose-100">
                <LogOut size={20}/> Terminar Sessão
              </Button>
            </main>
          </div>
        );

      case 'ADMIN_CONFIGS':
        return (
          <div className="flex flex-col h-full bg-slate-50 overflow-y-auto pb-24">
            <header className="bg-white p-6 border-b border-slate-100 flex items-center gap-4 sticky top-0 z-20">
              <button onClick={() => setCurrentView('ADMIN_DASHBOARD')} className="p-2 rounded-full bg-slate-100 text-slate-400"><ChevronLeft size={24} /></button>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Definições Globais</h2>
            </header>
            <main className="p-6 space-y-6">
              <Card>
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Percent size={14}/> Taxa de Comissão (Vendedores)
                </h4>
                <div className="flex items-center gap-6">
                  <div className="text-4xl font-black text-orange-600">{globalCommission}%</div>
                  <input 
                    type="range" 
                    min="1" 
                    max="50" 
                    value={globalCommission} 
                    onChange={(e) => setGlobalCommission(Number(e.target.value))}
                    className="flex-1 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-600"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-4 font-medium leading-relaxed italic">A comissão é calculada sobre o valor total de cada venda e adicionada ao saldo do vendedor instantaneamente.</p>
              </Card>

              <Card className="bg-slate-900 text-white border-none shadow-2xl">
                <h4 className="text-[11px] font-black text-orange-400 uppercase tracking-widest mb-4">Suporte & Backup</h4>
                <div className="space-y-4">
                  <button className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all text-left">
                    <Save size={20} className="text-white"/>
                    <span className="text-sm font-bold">Exportar Dados para JSON</span>
                  </button>
                  <button onClick={() => window.open(`tel:${SUPPORT_NUMBER}`)} className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all text-left">
                    <Phone size={20} className="text-white"/>
                    <span className="text-sm font-bold">Ligar para Suporte Técnico</span>
                  </button>
                </div>
              </Card>
            </main>
          </div>
        );

      default: return <div className="p-10 text-center text-slate-300">Em Desenvolvimento...</div>;
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden relative">
      <div className="flex-1 overflow-hidden relative">{renderView()}</div>
      
      {user && !['PAYMENT', 'RECEIPT', 'LOGIN', 'SIGNUP', 'ADMIN_MANAGE_VENDOR', 'ADMIN_REGISTER', 'ADMIN_PRODUCTS'].includes(currentView) && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 p-5 px-10 flex justify-between items-center z-50 rounded-t-[40px] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
          <button onClick={() => setCurrentView(user.role === 'ADMIN' ? 'ADMIN_DASHBOARD' : 'DASHBOARD')} className={`flex flex-col items-center gap-1 transition-all ${['DASHBOARD', 'ADMIN_DASHBOARD', 'ADMIN_CONFIGS'].includes(currentView) ? 'text-orange-600 scale-110' : 'text-slate-300'}`}>
            <LayoutDashboard size={24} /><span className="text-[8px] font-black uppercase">Início</span>
          </button>
          <button onClick={() => setCurrentView('HISTORY')} className={`flex flex-col items-center gap-1 transition-all ${currentView === 'HISTORY' ? 'text-orange-600 scale-110' : 'text-slate-300'}`}>
            <History size={24} /><span className="text-[8px] font-black uppercase">Atividade</span>
          </button>
          <button onClick={() => setCurrentView('SETTINGS')} className={`flex flex-col items-center gap-1 transition-all ${currentView === 'SETTINGS' ? 'text-orange-600 scale-110' : 'text-slate-300'}`}>
            <Settings size={24} /><span className="text-[8px] font-black uppercase">Perfil</span>
          </button>
        </nav>
      )}

      {/* Notifications Portal */}
      <div className="fixed top-4 left-4 right-4 z-[300] space-y-2 pointer-events-none">
        {notifications.map(n => (
          <div key={n.id} className={`p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 border-2 ${n.type === 'SUCCESS' ? 'bg-emerald-600 border-emerald-400 text-white' : n.type === 'ERROR' ? 'bg-rose-600 border-rose-400 text-white' : 'bg-slate-900 border-slate-700 text-white'}`}>
            {n.type === 'SUCCESS' ? <CheckCircle2 size={20} /> : n.type === 'ERROR' ? <AlertTriangle size={20} /> : <Info size={20} />}
            <span className="text-xs font-bold leading-tight">{n.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Support Icons not in default lucide-react (simulated)
const PackageSearch = (props: any) => <Database {...props} />;
