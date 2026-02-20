# File-Based Routing com TanStack Router

Este projeto usa file-based routing similar ao Next.js. Cada arquivo/pasta em `/src/app` gera uma rota automaticamente.

## Estrutura de Rotas

```
src/app/
├── __root.tsx          # Layout raiz (obrigatório)
├── index.tsx           # Rota / (página inicial)
├── about/
│   └── index.tsx       # Rota /about
└── dashboard/
    ├── index.tsx       # Rota /dashboard
    └── settings/
        └── index.tsx   # Rota /dashboard/settings
```

## Como Criar Novas Rotas

### Rota Simples
Crie um arquivo `index.tsx` em uma pasta:

```
src/app/contato/index.tsx
```

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/contato')({
  component: ContatoPage,
})

function ContatoPage() {
  return <div>Página de Contato</div>
}
```

### Rota Aninhada
Crie pastas aninhadas:

```
src/app/admin/usuarios/index.tsx
```

Isso cria a rota `/admin/usuarios`

### Rotas Dinâmicas
Para rotas com parâmetros, use `$` no nome do arquivo:

```
src/app/posts/$postId/index.tsx
```

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { useParams } from '@tanstack/react-router'

export const Route = createFileRoute('/posts/$postId')({
  component: PostPage,
})

function PostPage() {
  const { postId } = useParams({ from: '/posts/$postId' })
  return <div>Post: {postId}</div>
}
```

## Geração Automática

O arquivo `routeTree.gen.ts` é gerado automaticamente pelo plugin do TanStack Router. **Não edite este arquivo manualmente**.

Ele é regenerado sempre que você:
- Cria um novo arquivo em `/src/app`
- Deleta um arquivo
- Renomeia um arquivo

## Dicas

- O arquivo `__root.tsx` é obrigatório e define o layout raiz
- Use `index.tsx` para a rota padrão de uma pasta
- O arquivo `routeTree.gen.ts` é gerado automaticamente - não edite
- Você pode usar layouts aninhados criando `__layout.tsx` em subpastas (se necessário)
