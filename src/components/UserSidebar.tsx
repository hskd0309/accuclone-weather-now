
import React, { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, LogOut, Calendar, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const UserSidebar: React.FC = () => {
  const { user, isAuthenticated, login, signup, logout } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignup) {
      const success = await signup(formData.email, formData.password, formData.name);
      if (success) {
        toast({
          title: "Success",
          description: "Account created successfully!",
        });
        setIsOpen(false);
        setFormData({ email: '', password: '', name: '' });
      } else {
        toast({
          title: "Error",
          description: "User already exists",
          variant: "destructive",
        });
      }
    } else {
      const success = await login(formData.email, formData.password);
      if (success) {
        toast({
          title: "Success",
          description: "Logged in successfully!",
        });
        setIsOpen(false);
        setFormData({ email: '', password: '', name: '' });
      } else {
        toast({
          title: "Error",
          description: "Invalid credentials",
          variant: "destructive",
        });
      }
    }
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    toast({
      title: "Success",
      description: "Logged out successfully!",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
          <User size={20} />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[80vh]">
        <DrawerHeader>
          <DrawerTitle>
            {isAuthenticated ? 'Profile' : (isSignup ? 'Sign Up' : 'Sign In')}
          </DrawerTitle>
        </DrawerHeader>
        
        <div className="p-6">
          {isAuthenticated ? (
            // Profile View
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold">{user?.name}</h3>
                <p className="text-gray-600">{user?.email}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="text-blue-600" size={20} />
                    <span className="font-medium">Member Since</span>
                  </div>
                  <p className="text-gray-700">
                    {user?.signupDate ? formatDate(user.signupDate) : 'Unknown'}
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="text-green-600" size={20} />
                    <span className="font-medium">Cities Explored</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {user?.citiesChecked?.length || 0}
                  </p>
                </div>
              </div>

              {user?.citiesChecked && user.citiesChecked.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Recent Cities</h4>
                  <div className="flex flex-wrap gap-2">
                    {user.citiesChecked.slice(-10).map((city, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                      >
                        {city}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={handleLogout}
                variant="destructive"
                className="w-full"
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            // Login/Signup Form
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignup && (
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Enter your name"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="Enter your email"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  placeholder="Enter your password"
                />
              </div>
              
              <Button type="submit" className="w-full">
                {isSignup ? 'Sign Up' : 'Sign In'}
              </Button>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsSignup(!isSignup)}
                  className="text-blue-600 hover:underline text-sm"
                >
                  {isSignup ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                </button>
              </div>
            </form>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default UserSidebar;
