<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\UserInventory;
use App\Models\TradeOffer;
use Illuminate\Support\Facades\DB;
use Exception;

class TradeController extends Controller
{
    public function createTradeOffer(Request $request)
    {
        $request->validate([
            'recipient_id' => 'required|exists:users,id',
            'offered_item_ids' => 'required|array',
            'offered_item_ids.*' => 'exists:user_inventories,id',
            'requested_item_ids' => 'required|array',
            'requested_item_ids.*' => 'exists:user_inventories,id',
        ]);

        $user = Auth::user();
        $recipientId = $request->recipient_id;
        $offeredItemIds = $request->offered_item_ids;
        $requestedItemIds = $request->requested_item_ids;

        // Ensure user owns the offered items
        $userItems = UserInventory::whereIn('id', $offeredItemIds)->where('user_id', $user->id)->get();
        if ($userItems->count() !== count($offeredItemIds)) {
            return response()->json(['message' => 'You do not own all the offered items.'], 403);
        }

        // Ensure recipient owns the requested items
        $recipientItems = UserInventory::whereIn('id', $requestedItemIds)->where('user_id', $recipientId)->get();
        if ($recipientItems->count() !== count($requestedItemIds)) {
            return response()->json(['message' => 'Recipient does not own all the requested items.'], 400);
        }

        DB::beginTransaction();
        try {
            $tradeOffer = TradeOffer::create([
                'sender_id' => $user->id,
                'recipient_id' => $recipientId,
                'status' => 'pending',
            ]);

            // Attach items to the trade offer
            foreach ($offeredItemIds as $itemId) {
                $userItem = UserInventory::find($itemId);
                $userItem->trade_offer_id = $tradeOffer->id;
                $userItem->save();
            }

            foreach ($requestedItemIds as $itemId) {
                $recipientItem = UserInventory::find($itemId);
                $recipientItem->trade_offer_id = $tradeOffer->id;
                $recipientItem->save();
            }

            DB::commit();

            return response()->json(['message' => 'Trade offer created successfully.', 'trade_offer' => $tradeOffer], 201);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to create trade offer.', 'error' => $e->getMessage()], 500);
        }
    }

    public function acceptTradeOffer($tradeOfferId)
    {
        $user = Auth::user();
        $tradeOffer = TradeOffer::where('id', $tradeOfferId)->where('recipient_id', $user->id)->firstOrFail();

        if ($tradeOffer->status !== 'pending') {
            return response()->json(['message' => 'Trade offer is not pending.'], 400);
        }

        DB::beginTransaction();
        try {
            // Swap items
            foreach ($tradeOffer->offeredItems as $item) {
                $item->user_id = $tradeOffer->recipient_id;
                $item->trade_offer_id = null;
                $item->save();
            }

            foreach ($tradeOffer->requestedItems as $item) {
                $item->user_id = $tradeOffer->sender_id;
                $item->trade_offer_id = null;
                $item->save();
            }

            $tradeOffer->status = 'accepted';
            $tradeOffer->save();

            DB::commit();

            return response()->json(['message' => 'Trade offer accepted successfully.'], 200);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to accept trade offer.', 'error' => $e->getMessage()], 500);
        }
    }

    public function declineTradeOffer($tradeOfferId)
    {
        $user = Auth::user();
        $tradeOffer = TradeOffer::where('id', $tradeOfferId)->where('recipient_id', $user->id)->firstOrFail();

        if ($tradeOffer->status !== 'pending') {
            return response()->json(['message' => 'Trade offer is not pending.'], 400);
        }

        DB::beginTransaction();
        try {
            // Return items to owners
            foreach ($tradeOffer->offeredItems as $item) {
                $item->trade_offer_id = null;
                $item->save();
            }

            foreach ($tradeOffer->requestedItems as $item) {
                $item->trade_offer_id = null;
                $item->save();
            }

            $tradeOffer->status = 'declined';
            $tradeOffer->save();

            DB::commit();

            return response()->json(['message' => 'Trade offer declined successfully.'], 200);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to decline trade offer.', 'error' => $e->getMessage()], 500);
        }
    }

    public function getTradeOffers(Request $request)
    {
        $user = Auth::user();

        $tradeOffers = TradeOffer::with(['sender', 'recipient', 'offeredItems.baseWeapon', 'requestedItems.baseWeapon'])
                                 ->where('sender_id', $user->id)
                                 ->orWhere('recipient_id', $user->id)
                                 ->orderBy('created_at', 'desc')
                                 ->paginate(10);

        return response()->json(['trade_offers' => $tradeOffers], 200);
    }
}


