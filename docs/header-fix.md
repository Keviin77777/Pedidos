# Correção do Header para Desktop

## Problema Identificado

**Problema**: O ícone de notificação não aparecia no PC, apenas no mobile.

**Causa**: O header tinha a classe `lg:hidden`, fazendo com que ele só aparecesse no mobile. Quando removemos o `NotificationBell` do sidebar, o ícone ficou disponível apenas no mobile.

## Solução Implementada

### 1. **Header Visível em Todas as Telas**

**Arquivo**: `src/components/header.tsx`

```tsx
// Antes:
<header className="bg-card/30 backdrop-blur-lg border-b sticky top-0 z-10 lg:hidden">

// Depois:
<header className="bg-card/30 backdrop-blur-lg border-b sticky top-0 z-10">
```

### 2. **Layout Responsivo do Header**

```tsx
const Header = ({ onMenuClick }: HeaderProps) => {
  return (
    <header className="bg-card/30 backdrop-blur-lg border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Menu button - apenas mobile */}
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="mr-4 lg:hidden">
           <Menu className="h-6 w-6" />
           <span className="sr-only">Abrir Menu</span>
        </Button>
        
        {/* Título - apenas desktop */}
        <div className="hidden lg:flex items-center">
          <h1 className="text-xl font-bold tracking-tight">Pedidos Cine</h1>
        </div>
        
        {/* Notificações - sempre visível */}
        <div className="flex items-center gap-2">
          <NotificationBell />
        </div>
      </div>
    </header>
  );
};
```

### 3. **Ajuste no Sidebar**

**Arquivo**: `src/components/sidebar.tsx`

```tsx
// Antes:
<h1 className="text-xl font-bold tracking-tight">Pedidos Cine</h1>

// Depois:
<h1 className="text-xl font-bold tracking-tight lg:hidden">Pedidos Cine</h1>
```

## Layout Final

### **Desktop (lg e acima)**:
- ✅ Header visível com título "Pedidos Cine"
- ✅ Ícone de notificação no canto direito
- ✅ Sidebar sem título duplicado
- ✅ Menu hambúrguer oculto

### **Mobile (abaixo de lg)**:
- ✅ Header visível com menu hambúrguer
- ✅ Ícone de notificação no canto direito
- ✅ Sidebar com título "Pedidos Cine"

## Benefícios

- ✅ **Ícone de Notificação Universal**: Disponível em todas as telas
- ✅ **Layout Limpo**: Sem duplicação de elementos
- ✅ **Responsivo**: Adapta-se perfeitamente ao tamanho da tela
- ✅ **Consistente**: Mesma experiência em mobile e desktop
- ✅ **Acessível**: Mantém funcionalidade em todos os dispositivos

## Como Funciona

1. **Desktop**: Header com título + notificações, sidebar sem título
2. **Mobile**: Header com menu + notificações, sidebar com título
3. **Notificações**: Sempre visíveis no canto direito do header
4. **Navegação**: Menu hambúrguer apenas no mobile

O sistema agora está completamente funcional em todas as telas! 🚀
