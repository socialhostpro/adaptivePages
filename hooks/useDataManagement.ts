import { useState, useCallback, useEffect } from 'react';
import type { 
  ManagedPage, 
  ManagedProduct, 
  ManagedOrder, 
  CrmContact, 
  CrmForm,
  MediaFile,
  ProductCategory,
  PageGroup,
  TeamMember,
  ManagedBooking,
  OnboardingWizard,
  ProofingRequest
} from '../types';
import * as pageService from '../services/pageService';
import * as productService from '../services/productService';
import * as orderService from '../services/orderService';
import * as contactService from '../services/contactService';
import * as storageService from '../services/storageService';
import * as categoryService from '../services/categoryService';
import * as groupService from '../services/groupService';
import * as teamService from '../services/teamService';
import * as bookingService from '../services/bookingService';
import * as onboardingService from '../services/onboardingService';
import * as proofingService from '../services/proofingService';

export interface UseDataManagementReturn {
  // Pages
  managedPages: ManagedPage[];
  setManagedPages: (pages: ManagedPage[]) => void;
  isPagesLoading: boolean;
  refreshPages: () => Promise<void>;
  
  // Products
  managedProducts: ManagedProduct[];
  setManagedProducts: (products: ManagedProduct[]) => void;
  productCategories: ProductCategory[];
  setProductCategories: (categories: ProductCategory[]) => void;
  refreshProducts: () => Promise<void>;
  
  // Orders
  managedOrders: ManagedOrder[];
  setManagedOrders: (orders: ManagedOrder[]) => void;
  refreshOrders: () => Promise<void>;
  
  // Contacts & CRM
  crmContacts: CrmContact[];
  setCrmContacts: (contacts: CrmContact[]) => void;
  customForms: CrmForm[];
  setCustomForms: (forms: CrmForm[]) => void;
  refreshContacts: () => Promise<void>;
  
  // Media
  userMediaFiles: MediaFile[];
  setUserMediaFiles: (files: MediaFile[]) => void;
  refreshMedia: () => Promise<void>;
  uploadFile: (file: File) => Promise<void>;
  
  // Page Groups
  pageGroups: PageGroup[];
  setPageGroups: (groups: PageGroup[]) => void;
  refreshPageGroups: () => Promise<void>;
  
  // Team
  teamMembers: TeamMember[];
  setTeamMembers: (members: TeamMember[]) => void;
  refreshTeam: () => Promise<void>;
  
  // Bookings
  managedBookings: ManagedBooking[];
  setManagedBookings: (bookings: ManagedBooking[]) => void;
  refreshBookings: () => Promise<void>;
  
  // Onboarding & Proofing
  onboardingWizards: OnboardingWizard[];
  setOnboardingWizards: (wizards: OnboardingWizard[]) => void;
  proofingRequests: ProofingRequest[];
  setProofingRequests: (requests: ProofingRequest[]) => void;
  refreshOnboarding: () => Promise<void>;
  refreshProofing: () => Promise<void>;
  
  // Bulk operations
  refreshAllData: () => Promise<void>;
  isRefreshing: boolean;
}

export function useDataManagement(userId: string): UseDataManagementReturn {
  // State for all data types
  const [managedPages, setManagedPages] = useState<ManagedPage[]>([]);
  const [isPagesLoading, setIsPagesLoading] = useState(true);
  
  const [managedProducts, setManagedProducts] = useState<ManagedProduct[]>([]);
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
  
  const [managedOrders, setManagedOrders] = useState<ManagedOrder[]>([]);
  
  const [crmContacts, setCrmContacts] = useState<CrmContact[]>([]);
  const [customForms, setCustomForms] = useState<CrmForm[]>([]);
  
  const [userMediaFiles, setUserMediaFiles] = useState<MediaFile[]>([]);
  
  const [pageGroups, setPageGroups] = useState<PageGroup[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [managedBookings, setManagedBookings] = useState<ManagedBooking[]>([]);
  const [onboardingWizards, setOnboardingWizards] = useState<OnboardingWizard[]>([]);
  const [proofingRequests, setProofingRequests] = useState<ProofingRequest[]>([]);
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Individual refresh functions
  const refreshPages = useCallback(async () => {
    try {
      setIsPagesLoading(true);
      const pages = await pageService.getPages(userId);
      setManagedPages(pages);
    } catch (error) {
      console.error('Failed to refresh pages:', error);
    } finally {
      setIsPagesLoading(false);
    }
  }, [userId]);
  
  const refreshProducts = useCallback(async () => {
    try {
      const [products, categories] = await Promise.all([
        productService.getProducts(userId),
        categoryService.getCategories(userId)
      ]);
      setManagedProducts(products);
      setProductCategories(categories);
    } catch (error) {
      console.error('Failed to refresh products:', error);
    }
  }, [userId]);
  
  const refreshOrders = useCallback(async () => {
    try {
      const orders = await orderService.getOrdersForUser(userId);
      setManagedOrders(orders);
    } catch (error) {
      console.error('Failed to refresh orders:', error);
    }
  }, [userId]);
  
  const refreshContacts = useCallback(async () => {
    try {
      const [contacts, forms] = await Promise.all([
        contactService.getContacts(userId),
        contactService.getForms?.(userId) || []
      ]);
      setCrmContacts(contacts);
      setCustomForms(forms || []);
    } catch (error) {
      console.error('Failed to refresh contacts:', error);
    }
  }, [userId]);
  
  const refreshMedia = useCallback(async () => {
    try {
      const files = await storageService.listFiles(userId);
      setUserMediaFiles(files);
    } catch (error) {
      console.error('Failed to refresh media:', error);
    }
  }, [userId]);
  
  const refreshPageGroups = useCallback(async () => {
    try {
      const groups = await groupService.getGroups(userId);
      setPageGroups(groups);
    } catch (error) {
      console.error('Failed to refresh page groups:', error);
    }
  }, [userId]);
  
  const refreshTeam = useCallback(async () => {
    try {
      const members = await teamService.getTeamMembers(userId);
      setTeamMembers(members);
    } catch (error) {
      console.error('Failed to refresh team:', error);
    }
  }, [userId]);
  
  const refreshBookings = useCallback(async () => {
    try {
      const bookings = await bookingService.getBookingsForUser(userId);
      setManagedBookings(bookings);
    } catch (error) {
      console.error('Failed to refresh bookings:', error);
    }
  }, [userId]);
  
  const refreshOnboarding = useCallback(async () => {
    try {
      const wizards = await onboardingService.getWizards(userId);
      setOnboardingWizards(wizards);
    } catch (error) {
      console.error('Failed to refresh onboarding:', error);
    }
  }, [userId]);
  
  const refreshProofing = useCallback(async () => {
    try {
      const requests = await proofingService.getProofingRequests(userId);
      setProofingRequests(requests);
    } catch (error) {
      console.error('Failed to refresh proofing:', error);
    }
  }, [userId]);
  
  // File upload helper
  const uploadFile = useCallback(async (file: File) => {
    try {
      await storageService.uploadAndAnalyzeFile(userId, file);
      // Refresh media files after upload
      await refreshMedia();
    } catch (error) {
      console.error('Failed to upload file:', error);
      throw error;
    }
  }, [userId, refreshMedia]);
  
  // Bulk refresh all data
  const refreshAllData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refreshPages(),
        refreshProducts(),
        refreshOrders(),
        refreshContacts(),
        refreshMedia(),
        refreshPageGroups(),
        refreshTeam(),
        refreshBookings(),
        refreshOnboarding(),
        refreshProofing()
      ]);
    } catch (error) {
      console.error('Failed to refresh all data:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [
    refreshPages, refreshProducts, refreshOrders, refreshContacts,
    refreshMedia, refreshPageGroups, refreshTeam, refreshBookings,
    refreshOnboarding, refreshProofing
  ]);
  
  // Initial data load
  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);
  
  return {
    // Pages
    managedPages,
    setManagedPages,
    isPagesLoading,
    refreshPages,
    
    // Products
    managedProducts,
    setManagedProducts,
    productCategories,
    setProductCategories,
    refreshProducts,
    
    // Orders
    managedOrders,
    setManagedOrders,
    refreshOrders,
    
    // Contacts & CRM
    crmContacts,
    setCrmContacts,
    customForms,
    setCustomForms,
    refreshContacts,
    
    // Media
    userMediaFiles,
    setUserMediaFiles,
    refreshMedia,
    uploadFile,
    
    // Page Groups
    pageGroups,
    setPageGroups,
    refreshPageGroups,
    
    // Team
    teamMembers,
    setTeamMembers,
    refreshTeam,
    
    // Bookings
    managedBookings,
    setManagedBookings,
    refreshBookings,
    
    // Onboarding & Proofing
    onboardingWizards,
    setOnboardingWizards,
    proofingRequests,
    setProofingRequests,
    refreshOnboarding,
    refreshProofing,
    
    // Bulk operations
    refreshAllData,
    isRefreshing
  };
}
