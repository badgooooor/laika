import { useEffect } from 'react'
import { useContractReads } from 'wagmi'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCaption, TableCell, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Toaster } from '@/components/ui/toaster'
import { useToast } from '@/components/ui/use-toast'

import { EVMABIMethod, EVMContract } from '@/store/collections'

import { mainnet } from 'wagmi/chains'

export default function StateTab({ smartContract }: { smartContract: EVMContract }) {
  const { toast } = useToast()

  const getPrefetchableMethods = () => {
    const methods =
      smartContract && smartContract.contract && smartContract.contract.abi && JSON.parse(smartContract.contract.abi)
    if (!methods) {
      return []
    }
    const filteredMethods = methods.filter(
      (method: EVMABIMethod) =>
        method.inputs.length === 0 && (method.stateMutability === 'view' || method.stateMutability === 'pure'),
    )
    const prefetchableMethods = filteredMethods.map((method: EVMABIMethod) => {
      const address = smartContract.contract.address
      return {
        address,
        abi: filteredMethods,
        functionName: method.name,
        chainId: smartContract.chainId ? smartContract.chainId : mainnet.id,
      }
    })

    return prefetchableMethods
  }

  const { data, isError, isLoading } = useContractReads({
    contracts: getPrefetchableMethods(),
  })

  useEffect(() => {
    if (isError) {
      toast({
        title: 'Error',
        description: 'Error: Cannot fetch data.',
      })
    }
  }, [isError, toast])

  return (
    <div className="flex flex-col w-full gap-6">
      <Card className="w-full rounded-none">
        <CardHeader className="px-4 pt-4 pb-0">
          <CardTitle>INFO</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Table>
            <TableCaption>Result has been pre-fetched.</TableCaption>
            <TableBody>
              {data &&
                !isLoading &&
                data.map((row, idx) => {
                  const fields = getPrefetchableMethods()
                  return (
                    <TableRow key={`${fields[idx].functionName}`}>
                      <TableCell>{`${fields[idx].functionName}`}</TableCell>
                      <TableCell>{`${row.result}`}</TableCell>
                    </TableRow>
                  )
                })}
              {isLoading &&
                getPrefetchableMethods().map(() => {
                  return (
                    <TableRow>
                      <TableCell>
                        <Skeleton className="h-4 w-[250px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[250px]" />
                      </TableCell>
                    </TableRow>
                  )
                })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  )
}
