import { Reloader } from '@components/providers/Reloader';
import { Auth } from '@components/providers/Auth';
import { MenuShadow } from '@components/providers/MenuShadow';



export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <Reloader>
        <Auth>
        <MenuShadow>
            {children}
        </MenuShadow>
        </Auth>
        </Reloader>
    );
}