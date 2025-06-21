'use client'

import { useState } from 'react';
import { Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export function SizeChart() {
  const [isOpen, setIsOpen] = useState(false);

  const sizeData = [
    { size: 'S', length: '46-47', chest: '19', hip: '21', trouser: '39' },
    { size: 'M', length: '46-47', chest: '21', hip: '23', trouser: '39' },
    { size: 'L', length: '46-47', chest: '23', hip: '25', trouser: '39' },
    { size: 'XL', length: '46-47', chest: '25', hip: '27', trouser: '39' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex items-center gap-2 text-pink-600 hover:text-pink-700 font-medium h-auto p-0"
        >
          <Ruler size={16} />
          View Size Chart
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Size Chart</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Size in Inches Badge */}
          <div className="flex justify-center">
            <Badge variant="secondary" className="px-4 py-2">
              SIZE IN INCHES
            </Badge>
          </div>

          {/* Size Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold text-gray-900">SIZE</TableHead>
                  <TableHead className="font-semibold text-gray-900">LENGTH</TableHead>
                  <TableHead className="font-semibold text-gray-900">CHEST</TableHead>
                  <TableHead className="font-semibold text-gray-900">HIP</TableHead>
                  <TableHead className="font-semibold text-gray-900">TROUSER</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sizeData.map((row) => (
                  <TableRow key={row.size}>
                    <TableCell className="font-medium text-gray-900">
                      {row.size}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {row.length}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {row.chest}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {row.hip}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {row.trouser}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Brand Name */}
          <div className="text-center">
            <p className="text-gray-600 font-medium tracking-wider">JUNEBERRY</p>
          </div>

          {/* Additional Info */}
          <Card className="bg-pink-50 border-pink-100">
            <CardContent className="p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Measurement Guide:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• All measurements are in inches</li>
                <li>• Chest: Measure around the fullest part of your chest</li>
                <li>• Hip: Measure around the fullest part of your hips</li>
                <li>• Length: Measure from shoulder to desired hemline</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}