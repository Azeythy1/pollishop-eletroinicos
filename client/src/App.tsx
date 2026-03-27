import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductForm from "./pages/admin/AdminProductForm";
import AdminRates from "./pages/admin/AdminRates";

function Router() {
  return (
    <Switch>
      {/* Public catalog */}
      <Route path="/" component={Home} />
      <Route path="/produto/:id" component={ProductDetail} />

      {/* Admin panel */}
      <Route path="/admin" component={() => <AdminLayout><AdminProducts /></AdminLayout>} />
      <Route path="/admin/produtos" component={() => <AdminLayout><AdminProducts /></AdminLayout>} />
      <Route path="/admin/produtos/novo" component={() => <AdminLayout><AdminProductForm /></AdminLayout>} />
      <Route path="/admin/produtos/:id/editar" component={() => <AdminLayout><AdminProductForm /></AdminLayout>} />
      <Route path="/admin/taxas" component={() => <AdminLayout><AdminRates /></AdminLayout>} />

      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
