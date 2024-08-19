import { Auth } from '@components/providers/Auth';
import { MenuShadow } from '@components/providers/MenuShadow';



export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <Auth>
        <MenuShadow>
            {children}
        </MenuShadow>
        </Auth>
    );
}