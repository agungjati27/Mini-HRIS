import { useEffect, useMemo, useState } from "react";
import { getEmployeeProfile } from "../services/employeeService";

let cachedEmployee: any = null;
let cachedAt: number | null = null;

// TTL cache supaya data employee cepat tersedia tanpa request ulang
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 menit

function isCacheValid() {
  return cachedEmployee && cachedAt && Date.now() - cachedAt < CACHE_TTL_MS;
}

export default function useEmployee() {
  const initialEmployee = useMemo(() => {
    return isCacheValid() ? cachedEmployee : null;
  }, []);

  const [employee, setEmployee] = useState<any>(initialEmployee);
  const [loading, setLoading] = useState<boolean>(initialEmployee ? false : true);

  useEffect(() => {
    // Jika cache valid, skip fetch
    if (isCacheValid()) return;

    let isMounted = true;

    async function load() {
      try {
        const result = await getEmployeeProfile();
        if (!isMounted) return;

        const data = result?.data ?? null;
        cachedEmployee = data;
        cachedAt = Date.now();
        setEmployee(data);
      } catch (error) {
        console.log(error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  return { employee, loading };
}
