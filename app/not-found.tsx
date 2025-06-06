import Link from "next/link";
import Threads from "@/app/components/Threads/Threads";

export default function NotFound() {
    return (
        <div style={{ width: '100%', height: '600px', position: 'relative' }} className={'min-h-screen'}>

            <Threads

                amplitude={1}

                distance={0}

                enableMouseInteraction={true}

            >
                <Link href="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    На главную
                </Link>
            </Threads>

        </div>
    );
}