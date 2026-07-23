import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

// Major Indian cities for autocomplete
const INDIA_CITIES = [
  { name: 'Manali', state: 'Himachal Pradesh' },
  { name: 'Shimla', state: 'Himachal Pradesh' },
  { name: 'Dharamshala', state: 'Himachal Pradesh' },
  { name: 'Kasauli', state: 'Himachal Pradesh' },
  { name: 'Kasol', state: 'Himachal Pradesh' },
  { name: 'Dalhousie', state: 'Himachal Pradesh' },
  { name: 'Mussoorie', state: 'Uttarakhand' },
  { name: 'Nainital', state: 'Uttarakhand' },
  { name: 'Rishikesh', state: 'Uttarakhand' },
  { name: 'Haridwar', state: 'Uttarakhand' },
  { name: 'Mukteshwar', state: 'Uttarakhand' },
  { name: 'Ranikhet', state: 'Uttarakhand' },
  { name: 'Bhimtal', state: 'Uttarakhand' },
  { name: 'Dehradun', state: 'Uttarakhand' },
  { name: 'Auli', state: 'Uttarakhand' },
  { name: 'Goa', state: 'Goa' },
  { name: 'Panaji', state: 'Goa' },
  { name: 'North Goa', state: 'Goa' },
  { name: 'South Goa', state: 'Goa' },
  { name: 'Jaipur', state: 'Rajasthan' },
  { name: 'Udaipur', state: 'Rajasthan' },
  { name: 'Jodhpur', state: 'Rajasthan' },
  { name: 'Jaisalmer', state: 'Rajasthan' },
  { name: 'Pushkar', state: 'Rajasthan' },
  { name: 'Ranthambore', state: 'Rajasthan' },
  { name: 'Mount Abu', state: 'Rajasthan' },
  { name: 'Kochi', state: 'Kerala' },
  { name: 'Munnar', state: 'Kerala' },
  { name: 'Alleppey', state: 'Kerala' },
  { name: 'Thekkady', state: 'Kerala' },
  { name: 'Wayanad', state: 'Kerala' },
  { name: 'Kovalam', state: 'Kerala' },
  { name: 'Varkala', state: 'Kerala' },
  { name: 'Thiruvananthapuram', state: 'Kerala' },
  { name: 'Kozhikode', state: 'Kerala' },
  { name: 'Leh', state: 'Ladakh' },
  { name: 'Ladakh', state: 'Ladakh' },
  { name: 'Nubra Valley', state: 'Ladakh' },
  { name: 'Pangong Lake', state: 'Ladakh' },
  { name: 'Srinagar', state: 'Kashmir' },
  { name: 'Gulmarg', state: 'Kashmir' },
  { name: 'Pahalgam', state: 'Kashmir' },
  { name: 'Sonmarg', state: 'Kashmir' },
  { name: 'Mumbai', state: 'Maharashtra' },
  { name: 'Pune', state: 'Maharashtra' },
  { name: 'Lonavala', state: 'Maharashtra' },
  { name: 'Mahabaleshwar', state: 'Maharashtra' },
  { name: 'Alibaug', state: 'Maharashtra' },
  { name: 'Panchgani', state: 'Maharashtra' },
  { name: 'Igatpuri', state: 'Maharashtra' },
  { name: 'Nashik', state: 'Maharashtra' },
  { name: 'Bangalore', state: 'Karnataka' },
  { name: 'Bengaluru', state: 'Karnataka' },
  { name: 'Coorg', state: 'Karnataka' },
  { name: 'Mysore', state: 'Karnataka' },
  { name: 'Chikmagalur', state: 'Karnataka' },
  { name: 'Hampi', state: 'Karnataka' },
  { name: 'Gokarna', state: 'Karnataka' },
  { name: 'Ooty', state: 'Tamil Nadu' },
  { name: 'Kodaikanal', state: 'Tamil Nadu' },
  { name: 'Chennai', state: 'Tamil Nadu' },
  { name: 'Mahabalipuram', state: 'Tamil Nadu' },
  { name: 'Yercaud', state: 'Tamil Nadu' },
  { name: 'Delhi', state: 'Delhi' },
  { name: 'New Delhi', state: 'Delhi' },
  { name: 'Gurgaon', state: 'Haryana' },
  { name: 'Gurugram', state: 'Haryana' },
  { name: 'Manesar', state: 'Haryana' },
  { name: 'Faridabad', state: 'Haryana' },
  { name: 'Noida', state: 'Uttar Pradesh' },
  { name: 'Agra', state: 'Uttar Pradesh' },
  { name: 'Varanasi', state: 'Uttar Pradesh' },
  { name: 'Vrindavan', state: 'Uttar Pradesh' },
  { name: 'Mathura', state: 'Uttar Pradesh' },
  { name: 'Lucknow', state: 'Uttar Pradesh' },
  { name: 'Ayodhya', state: 'Uttar Pradesh' },
  { name: 'Darjeeling', state: 'West Bengal' },
  { name: 'Kalimpong', state: 'West Bengal' },
  { name: 'Kolkata', state: 'West Bengal' },
  { name: 'Sundarbans', state: 'West Bengal' },
  { name: 'Gangtok', state: 'Sikkim' },
  { name: 'Pelling', state: 'Sikkim' },
  { name: 'Lachung', state: 'Sikkim' },
  { name: 'Shillong', state: 'Meghalaya' },
  { name: 'Cherrapunji', state: 'Meghalaya' },
  { name: 'Guwahati', state: 'Assam' },
  { name: 'Kaziranga', state: 'Assam' },
  { name: 'Tawang', state: 'Arunachal Pradesh' },
  { name: 'Ziro', state: 'Arunachal Pradesh' },
  { name: 'Andaman', state: 'Andaman & Nicobar' },
  { name: 'Port Blair', state: 'Andaman & Nicobar' },
  { name: 'Havelock Island', state: 'Andaman & Nicobar' },
  { name: 'Neil Island', state: 'Andaman & Nicobar' },
  { name: 'Hyderabad', state: 'Telangana' },
  { name: 'Ahmedabad', state: 'Gujarat' },
  { name: 'Kutch', state: 'Gujarat' },
  { name: 'Dwarka', state: 'Gujarat' },
  { name: 'Diu', state: 'Daman & Diu' },
  { name: 'Puri', state: 'Odisha' },
  { name: 'Konark', state: 'Odisha' },
  { name: 'Bhubaneswar', state: 'Odisha' },
  { name: 'Amritsar', state: 'Punjab' },
  { name: 'Chandigarh', state: 'Chandigarh' },
];

@Injectable()
export class LocationsService {
  private readonly logger = new Logger(LocationsService.name);

  constructor(private supabaseService: SupabaseService) {}

  async searchCities(query: string, limit: number = 10): Promise<any[]> {
    if (!query || query.trim().length === 0) {
      return INDIA_CITIES.slice(0, limit);
    }

    const q = query.toLowerCase().trim();
    
    // Search in hardcoded India cities
    const matches = INDIA_CITIES.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.state.toLowerCase().includes(q)
    );

    // Also search in existing properties
    try {
      const { data: properties } = await this.supabaseService.admin
        .from('properties')
        .select('location')
        .eq('status', 'active');
      
      const cityMap = new Map<string, { name: string; state: string }>();
      
      // Add all matches from list
      matches.forEach(m => cityMap.set(m.name.toLowerCase(), m));
      
      // Add from properties
      (properties ?? []).forEach((p: any) => {
        const city = p.location?.city;
        const state = p.location?.state;
        if (city && city.toLowerCase().includes(q)) {
          cityMap.set(city.toLowerCase(), { name: city, state: state ?? '' });
        }
      });
      
      return Array.from(cityMap.values()).slice(0, limit);
    } catch {
      return matches.slice(0, limit);
    }
  }

  getAllCities(): Array<{ name: string; state: string }> {
    return INDIA_CITIES;
  }

  getCitiesByState(state: string): Array<{ name: string; state: string }> {
    return INDIA_CITIES.filter(c => 
      c.state.toLowerCase() === state.toLowerCase()
    );
  }
}
